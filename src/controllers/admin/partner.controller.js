import * as PartnerService from "../../services/admin/partner.service.js";
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Fetch all active Partners
const getAllPartners = asyncHandler(async (req, res) => {
  const Partners = await PartnerService.getAllPartners();

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, Partners, "Partners fetched successfully")
    );
});

const createPartner = asyncHandler(async (req, res) => {

  const newPartner = await PartnerService.createPartner(
    req,
  );

  return res
    .status(httpStatus.CREATED)
    .json(
      new ApiResponse(
        httpStatus.CREATED,
        newPartner,
        "Partner created successfully"
      )
    );
});

// Fetch a single Partner by ID
const getPartnerById = asyncHandler(async (req, res) => {
  const Partner = await PartnerService.getPartnerById(req.params.id);

  if (!Partner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, Partner, "Partner fetched successfully"));
});

// Update a Partner by ID
const updatePartnerBasicDetailsById = asyncHandler(async (req, res) => {

  const updatedPartner = await PartnerService.updatePartnerBasicDetailsById(req.params.id, req.body);

  if (!updatedPartner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, updatedPartner, "Basic Details updated successfully")
    );
});

const updateGstDetailsById = asyncHandler(async (req, res) => {

  const updatedPartner = await PartnerService.updateGstDetailsById(req.params.id, req.files, req.body);
  if (!updatedPartner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, updatedPartner, "Gst Details updated successfully")
    );
});

const updateFirmDetailsById = asyncHandler(async (req, res) => {
  const updatedPartner = await PartnerService.updateFirmDetailsById(req.params.id, req.body);

  if (!updatedPartner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, updatedPartner, "Firm Details updated successfully")
    );
});

const updateBankDetailsById = asyncHandler(async (req, res) => {
  const updatedPartner = await PartnerService.updateBankDetailsById(req.params.id, req.body);

  if (!updatedPartner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, updatedPartner, "Bank Details updated successfully")
    );
});

const updatePartnerDetailsById = asyncHandler(async (req, res) => {
  const updatedPartner = await PartnerService.updatePartnerDetailsById(req.params.id, req.body);

  if (!updatedPartner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, updatedPartner, "Partner details updated successfully"));
});


// Soft delete a Partner by ID (logical deletion)
const softDeletePartnerById = asyncHandler(async (req, res) => {
  const deletedPartner = await PartnerService.softDeletePartnerById(req.params.id);

  if (!deletedPartner) {
    throw new ApiError(httpStatus.NOT_FOUND, "Partner not found");
  }

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, deletedPartner, "Partner deleted successfully")
    );
});

// Partner login - generates OTP
const partnerLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const response = await PartnerService.partnerLogin(email, password);

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, response, "Login successfully"));
});

// Partner logout - invalidates refresh token
const partnerLogout = asyncHandler(async (req, res) => {
  const partnerId = req.partner.id;

  const response = await PartnerService.partnerLogout(partnerId);

  return res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, {}, "Logout successful"));
});

// Partner password change
const changePartnerPassword = asyncHandler(async (req, res) => {
  const partnerId = req.partner.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(
        new ApiResponse(
          httpStatus.BAD_REQUEST,
          null,
          "Current and new password are required"
        )
      );
  }

  const response = await PartnerService.changePassword(
    partnerId,
    currentPassword,
    newPassword
  );

  return res
    .status(httpStatus.OK)
    .json(
      new ApiResponse(httpStatus.OK, response, "Password changed successfully")
    );
});

export {
  createPartner,
  getAllPartners,
  getPartnerById,
  updatePartnerBasicDetailsById,
  updateGstDetailsById,
  updateFirmDetailsById,
  updateBankDetailsById,
  updatePartnerDetailsById,
  softDeletePartnerById,
  partnerLogin,
  partnerLogout,
  changePartnerPassword,
};
