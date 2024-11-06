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
        accountNumber: accountNumber,
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
    const partner = await Admin.findById(id).populate("roleId").populate("adminId");
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }
    return partner;
};

const updatePartnerBasicDetailsById = async (id, data) => {
    const { name, email, phone, secondaryPhone, status } = data;

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (secondaryPhone) updateData.secondaryPhone = secondaryPhone;
    if (status) updateData.status = status;

    const updatedPartner = await Admin.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPartner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return updatedPartner;
};

const updateGstDetailsById = async (id, files, data) => {
    const { gst, gstNumber, gstType, compositionType, cessType, goodsServiceType, percentage } = data;


    const updateData = {};

    if (gst) updateData.gst = gst;
    if (gstNumber) updateData.gstNumber = gstNumber;
    if (gstType) updateData.gstType = gstType;
    if (compositionType) updateData.compositionType = compositionType;
    if (cessType) updateData.cessType = cessType;
    if (goodsServiceType) updateData.goodsServiceType = goodsServiceType;
    if (percentage) updateData.percentage = percentage;

    const updatedPartner = await Admin.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPartner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return updatedPartner;
};

const updateFirmDetailsById = async (id, data) => {
    const { panNumber, aadharNumber, panImage, aadharFrontImage, aadharBackImage, firmName, firmAddress, firmType, cinNumber } = data;

    // Upload images to Cloudinary
    const panImageUrl = panImage ? await uploadOnCloudinary(panImage) : null;
    const aadharFrontImageUrl = aadharFrontImage ? await uploadOnCloudinary(aadharFrontImage) : null;
    const aadharBackImageUrl = aadharBackImage ? await uploadOnCloudinary(aadharBackImage) : null;

    if (panImage && !panImageUrl?.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading Pan Image");
    }

    if (aadharFrontImage && !aadharFrontImageUrl?.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading Aadhar Front Image");
    }

    if (aadharBackImage && !aadharBackImageUrl?.url) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error uploading Aadhar Back Image");
    }

    const updateData = {};

    if (panNumber) updateData.panNumber = panNumber;
    if (panImage) updateData.panImage = panImageUrl?.url;
    if (aadharNumber) updateData.aadharNumber = aadharNumber;
    if (aadharFrontImage) updateData.aadharFrontImage = aadharFrontImageUrl?.url;
    if (aadharBackImage) updateData.aadharBackImage = aadharBackImageUrl?.url;
    if (firmName) updateData.firmName = firmName;
    if (firmAddress) updateData.firmAddress = firmAddress;
    if (firmType) updateData.firmType = firmType;
    if (cinNumber) updateData.cinNumber = cinNumber;

    const updatedPartner = await Admin.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPartner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return updatedPartner;
};

const updateBankDetailsById = async (id, data) => {
    const { bankName, accountNumber, ifscCode, accountHolderName } = data;


    const updateData = {};

    if (bankName) updateData.bankName = bankName;
    if (accountNumber) updateData.accountNumber = accountNumber;
    if (ifscCode) updateData.ifscCode = ifscCode;
    if (accountHolderName) updateData.accountHolderName = accountHolderName;

    const updatedPartner = await Admin.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPartner) {
        throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
    }

    return updatedPartner;
};

const updatePartnerDetailsById = async (id, data) => {
    const { partners } = data;

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

    // Assuming you are updating the partner details in a database, 
    // use formattedPartners and `id` to perform the update
    const updatedPartner = await Admin.findByIdAndUpdate(id, { partners: formattedPartners }, { new: true });

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
    updatePartnerBasicDetailsById,
    updateGstDetailsById,
    updateFirmDetailsById,
    updateBankDetailsById,
    updatePartnerDetailsById,
    softDeletePartnerById,
    partnerLogin,
    partnerChangePassword,
};
