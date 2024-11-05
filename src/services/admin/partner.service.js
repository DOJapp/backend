import { Admin } from "../../models/admin.model.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { generateAdminAccessAndRefreshTokens } from "../../utils/tokenUtils.js";

// Helper function to check for email or phone uniqueness
const checkUniqueFields = async (panNumber, phone, excludeId = null) => {
    const panNumberExists = await Admin.findOne({
        panNumber,
        _id: { $ne: excludeId },
    });
    if (panNumberExists) {
        throw new ApiError(httpStatus.CONFLICT, "Pan Number is already taken");
    }
};
const convertBlobToFile = async (blobUrl) => {
    const response = await fetch(blobUrl);
    console.log("response", response);
    const blob = await response.blob();
    const file = new File([blob], 'uploadedFile', { type: blob.type });
    console.log("file", file);
    return file;
};

const createPartner = async (req) => {
    const {
        gstSelected,
        gstNumber,
        firmType,
        gstType,
        compositonType,
        cessType,
        goodsServiceType,
        percentage,
        cinNumber,
        panNumber,
        aadharNumber,
        firmName,
        firmAddress,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        panImage,
        aadharFrontImage,
        aadharBackImage,
        documentImages,
        partners,
    } = req.body;

    if (!gstSelected) {
        throw new ApiError(httpStatus.BAD_REQUEST, "GST selection is required");
    }

    if (!firmName) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Frim Name is required");
    }

    if (!firmAddress) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Frim Address is required");
    }

    if (!panNumber) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Pan Number is required");
    }

    // Check if PAN number already exists
    await checkUniqueFields(panNumber);

    // Upload images to Cloudinary
    const panImageUrl = panImage ? await uploadOnCloudinary(panImage) : null;
    const aadharFrontImageUrl = aadharFrontImage ? await uploadOnCloudinary(aadharFrontImage) : null;
    const aadharBackImageUrl = aadharBackImage ? await uploadOnCloudinary(aadharBackImage) : null;

    // Upload documents to Cloudinary
    // let documentsUrls = [];
    // if (documentImages && Array.isArray(documentImages)) {
    //     for (const documentPath of documentImages) {
    //         try {
    //             const file = await convertBlobToFile(documentPath);
    //             const uploadedDocument = await uploadOnCloudinary(file);
    //             if (uploadedDocument?.url) {
    //                 documentsUrls.push(uploadedDocument.url);
    //             } else {
    //                 throw new Error('Invalid document upload response');
    //             }
    //         } catch (error) {
    //             console.error("Error during document upload:", error);
    //             throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error uploading document: ${documentPath}`);
    //         }
    //     }
    // }

    // Ensure uploads were successful
    if (panImageUrl && !panImageUrl?.url)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading Pan Image");
    if (aadharFrontImageUrl && !aadharFrontImageUrl?.url)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading Aadhar Front Image");
    if (aadharBackImageUrl && !aadharBackImageUrl?.url)
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading Aadhar Back Image");


    const formattedPartners = await Promise.all((partners || []).map(async (partner) => {
        const panImageUpload = partner.panImage ? await uploadOnCloudinary(partner.panImage) : null;
        const aadharFrontImageUpload = partner.aadharFrontImage ? await uploadOnCloudinary(partner.aadharFrontImage) : null;
        const aadharBackImageUpload = partner.aadharBackImage ? await uploadOnCloudinary(partner.aadharBackImage) : null;

        return {
            panNumber: partner.panNumber,
            panImage: panImageUpload ? panImageUpload.url : null,
            aadharNumber: partner.aadharNumber,
            aadharFrontImage: aadharFrontImageUpload ? aadharFrontImageUpload.url : null,
            aadharBackImage: aadharBackImageUpload ? aadharBackImageUpload.url : null,
            document: partner.document || [],
            bankName: partner.bankName,
            accountNumber: partner.accountNumber,
            ifscCode: partner.ifscCode,
            accountHolderName: partner.accountHolderName,
        };
    }));

    console.log("formattedPartners", formattedPartners)
    // Construct main partner data
    const partnerData = {
        gst: gstSelected,
        roleId: "671cb0fe0baa23adbb0a1305", // Example role ID
        firmName,
        firmAddress,
        gstNumber: gstSelected === "Yes" ? gstNumber : null,
        firmType: gstSelected === "Yes" ? firmType : null,
        gstType,
        compositonType,
        cessType,
        goodsServiceType,
        percentage,
        cinNumber: gstSelected === "Yes" ? cinNumber : null,
        panNumber,
        panImage: panImageUrl?.url,
        aadharNumber,
        aadharFrontImage: aadharFrontImageUrl?.url,
        aadharBackImage: aadharBackImageUrl?.url,
        bankName,
        accountNo: accountNumber,
        ifscCode,
        accountHolderName,
        // documents: documentsUrls,
        partners: formattedPartners,
    };

    const newPartner = new Admin(partnerData);

    // Save the new partner record to the database
    return await newPartner.save();
};

// Additional functions follow the same format as above but with Partner model references

const getAllPartners = async () => {
    return await Admin.find().populate("roleId");
};

const getAllActivePartners = async () => {
    return await Admin.find({ status: "Active" }).populate("roleId");
};

const getPartnerById = async (id) => {
    const partner = await Admin.findById(id).populate("roleId");
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }
    return partner;
};

const updatePartnerById = async (
    id,
    data,
    avatarLocalPath,
    aadharFrontImageLocalPath,
    aadharBackImageLocalPath,
    panImageLocalPath
) => {
    const { name, email, phone, secondaryPhone, aadharNo, panNo, roleId } = data;

    await checkUniqueFields(email, phone, id);

    const updateData = {};

    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar?.url) {
            updateData.avatar = avatar.url;
        } else {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Error while uploading avatar"
            );
        }
    }

    if (aadharFrontImageLocalPath) {
        const aadharFrontImage = await uploadOnCloudinary(
            aadharFrontImageLocalPath
        );
        if (aadharFrontImage?.url) {
            updateData.aadharFrontImage = aadharFrontImage.url;
        } else {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Error while uploading Aadhar Front Image"
            );
        }
    }

    if (aadharBackImageLocalPath) {
        const aadharBackImage = await uploadOnCloudinary(aadharBackImageLocalPath);
        if (aadharBackImage?.url) {
            updateData.aadharBackImage = aadharBackImage.url;
        } else {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Error while uploading Aadhar Back Image"
            );
        }
    }

    if (panImageLocalPath) {
        const panImage = await uploadOnCloudinary(panImageLocalPath);
        if (panImage?.url) {
            updateData.panImage = panImage.url;
        } else {
            throw new ApiError(
                httpStatus.INTERNAL_SERVER_ERROR,
                "Error while uploading Pan Image"
            );
        }
    }

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (secondaryPhone) updateData.secondaryPhone = secondaryPhone;
    if (roleId) updateData.roleId = roleId;
    if (aadharNo) updateData.aadharNo = aadharNo;
    if (panNo) updateData.panNo = panNo;

    const updatedPartner = await Admin.findByIdAndUpdate(id, updateData, {
        new: true,
    });
    if (!updatedPartner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return updatedPartner;
};

const softDeletePartnerById = async (id) => {
    const partner = await Admin.findById(id);
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }
    if (partner.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Partner is already deleted");
    }
    partner.isDeleted = true;
    await partner.save();
    return partner;
};

const partnerLogin = async (email, password) => {
    const partner = await Admin.findOne({ email });
    if (!partner) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
    }

    const { accessToken, refreshToken } =
        await generateAdminAccessAndRefreshTokens(partner._id);
    const partnerData = await Admin.findById(partner._id)
        .populate("roleId")
        .select("-password -refreshToken");

    return {
        ...partnerData.toObject(),
        accessToken,
        refreshToken,
    };
};

const partnerChangePassword = async (partnerId, oldPassword, newPassword) => {
    const partner = await Admin.findById(partnerId);
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }

    const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        partner.password
    );
    if (!isOldPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    partner.password = await bcrypt.hash(newPassword, 10);
    await partner.save();

    return partner;
};

export {
    createPartner,
    getAllPartners,
    getAllActivePartners,
    getPartnerById,
    updatePartnerById,
    softDeletePartnerById,
    partnerLogin,
    partnerChangePassword,
};
