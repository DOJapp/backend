import { Admin } from '../../models/admin.model.js';
import { uploadOnCloudinary } from '../../utils/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';
import httpStatus from 'http-status';
import bcrypt from "bcrypt"
import { generateAdminAccessAndRefreshTokens } from "../../utils/tokenUtils.js";

// Helper function to check for email or phone uniqueness
const checkUniqueFields = async (email, phone, excludeId = null) => {
    const emailExists = await Admin.findOne({ email, _id: { $ne: excludeId } });
    if (emailExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Email is already taken');
    }
    const phoneExists = await Admin.findOne({ phone, _id: { $ne: excludeId } });
    if (phoneExists) {
        throw new ApiError(httpStatus.CONFLICT, 'Phone number is already taken');
    }
};

const createPartner = async (req, avatarLocalPath, aadharFrontImageLocalPath, aadharBackImageLocalPath, panImageLocalPath) => {
    const { name, email, password, phone, secondaryPhone, aadharNo, panNo, gst, firmType, roleId, gstDetails, partnerDetails } = req.body;
    const addedBy = req?.user?._id ?? null;

    // Check if email or phone already exists
    await checkUniqueFields(email, phone);

    // Upload images to Cloudinary
    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const aadharFrontImage = aadharFrontImageLocalPath ? await uploadOnCloudinary(aadharFrontImageLocalPath) : null;
    const aadharBackImage = aadharBackImageLocalPath ? await uploadOnCloudinary(aadharBackImageLocalPath) : null;
    const panImage = panImageLocalPath ? await uploadOnCloudinary(panImageLocalPath) : null;

    // Ensure uploads were successful
    if (avatarLocalPath && !avatar?.url) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading avatar');
    if (aadharFrontImageLocalPath && !aadharFrontImage?.url) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading Aadhar Front Image');
    if (aadharBackImageLocalPath && !aadharBackImage?.url) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading Aadhar Back Image');
    if (panImageLocalPath && !panImage?.url) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading Pan Card Image');

    // Initialize main partner data object
    const partnerData = {
        name,
        email,
        password,
        phone,
        roleId,
        secondaryPhone,
        aadharNo,
        panNo,
        gst,
        firmType,
        avatar: avatar?.url || 'default.png',
        aadharFrontImage: aadharFrontImage?.url,
        aadharBackImage: aadharBackImage?.url,
        panImage: panImage?.url,
        addedBy,
    };

    // Conditional setup based on GST and firm type
    if (gst === "Yes") {
        if (gstDetails) {
            partnerData.gstDetails = gstDetails;
        } else {
            throw new ApiError(httpStatus.BAD_REQUEST, "GST details are required when GST is 'Yes'");
        }
    }

    // Populate firm-specific details based on firmType
    switch (firmType) {
        case "Propriter":
            partnerData.propriterDetails = {
                bankDetails: req.body.bankDetails,
                panNo,
                panImage: partnerData.panImage,
                aadharNo,
                aadharFrontImage: partnerData.aadharFrontImage,
                aadharBackImage: partnerData.aadharBackImage,
            };
            break;

        case "Partnership":
        case "LLP":
        case "PVT LTD":
        case "Limited":
            const partnerSchemaKey = firmType.toLowerCase() + "Details";
            partnerData[partnerSchemaKey] = {
                panNo,
                panImage: partnerData.panImage,
                aadharNo,
                aadharFrontImage: partnerData.aadharFrontImage,
                aadharBackImage: partnerData.aadharBackImage,
                bankDetails: req.body.bankDetails,
                partnerDetails: partnerDetails || {},
            };
            if (firmType !== "Partnership") {
                partnerData[partnerSchemaKey].cinNo = req.body.cinNo || null;
            }
            break;

        default:
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid firm type");
    }

    const newPartner = new Admin(partnerData);

    return await newPartner.save();
};

// Additional functions follow the same format as above but with Partner model references

const getAllPartners = async () => {
    return await Admin.find().populate("roleId");
};

const getAllActivePartners = async () => {
    return await Admin.find({ status: 'Active' }).populate("roleId");
};

const getPartnerById = async (id) => {
    const partner = await Admin.findById(id).populate("roleId");
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Partner not found');
    }
    return partner;
};

const updatePartnerById = async (id, data, avatarLocalPath, aadharFrontImageLocalPath, aadharBackImageLocalPath, panImageLocalPath) => {
    const { name, email, phone, secondaryPhone, aadharNo, panNo, roleId } = data;

    await checkUniqueFields(email, phone, id);

    const updateData = {};

    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar?.url) {
            updateData.avatar = avatar.url;
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while uploading avatar');
        }
    }

    if (aadharFrontImageLocalPath) {
        const aadharFrontImage = await uploadOnCloudinary(aadharFrontImageLocalPath);
        if (aadharFrontImage?.url) {
            updateData.aadharFrontImage = aadharFrontImage.url;
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while uploading Aadhar Front Image');
        }
    }

    if (aadharBackImageLocalPath) {
        const aadharBackImage = await uploadOnCloudinary(aadharBackImageLocalPath);
        if (aadharBackImage?.url) {
            updateData.aadharBackImage = aadharBackImage.url;
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while uploading Aadhar Back Image');
        }
    }

    if (panImageLocalPath) {
        const panImage = await uploadOnCloudinary(panImageLocalPath);
        if (panImage?.url) {
            updateData.panImage = panImage.url;
        } else {
            throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error while uploading Pan Image');
        }
    }

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (secondaryPhone) updateData.secondaryPhone = secondaryPhone;
    if (roleId) updateData.roleId = roleId;
    if (aadharNo) updateData.aadharNo = aadharNo;
    if (panNo) updateData.panNo = panNo;

    const updatedPartner = await Admin.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPartner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Partner not found');
    }

    return updatedPartner;
};

const softDeletePartnerById = async (id) => {
    const partner = await Admin.findById(id);
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Partner not found');
    }
    if (partner.isDeleted) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Partner is already deleted');
    }
    partner.isDeleted = true;
    await partner.save();
    return partner;
};

const partnerLogin = async (email, password) => {
    const partner = await Admin.findOne({ email });
    if (!partner) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    const { accessToken, refreshToken } = await generateAdminAccessAndRefreshTokens(partner._id);
    const partnerData = await Admin.findById(partner._id).populate("roleId").select("-password -refreshToken");

    return {
        ...partnerData.toObject(),
        accessToken,
        refreshToken
    };
};

const partnerChangePassword = async (partnerId, oldPassword, newPassword) => {
    const partner = await Admin.findById(partnerId);
    if (!partner) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Partner not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, partner.password);
    if (!isOldPasswordValid) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
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
    partnerChangePassword
};
