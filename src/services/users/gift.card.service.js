import { GiftCard } from '../../models/gift.card.model.js';
import { ApiError } from "../../utils/ApiError.js";
import httpStatus from "http-status";

// Function to create a new GiftCard with an image
const create = async (userId, data) => {

    const { giftCardCategoryId, value } = data;


    if (!value) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Value is required.");
    }

    if (!giftCardCategoryId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Category is required.");
    }

    // Prepare GiftCard data according to the schema
    const giftCardData = {
        giftCardCategoryId,
        value,
        userId,
    };

    // Create and save the new GiftCard
    const newGiftCard = new GiftCard(giftCardData);

    // Save the GiftCard to the database
    return await newGiftCard.save();
};

// Function to fetch all gift cards
const getAllGiftCards = async (userId) => {
    return await GiftCard.find({ userId: userId }).populate('giftCardCategoryId');
};


// Function to fetch a gift card by ID
const getById = async (id) => {
    const giftCard = await GiftCard.findById(id).populate('giftCardCategoryId');
    if (!giftCard) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gift card not found");
    }
    return giftCard;
};



const redeem = async (giftCardCode, pin, userId) => {
    // Find the gift card by code
    const giftCard = await GiftCard.findOne({ code: giftCardCode });

    // Check if the gift card exists
    if (!giftCard) {
        throw new ApiError(httpStatus.NOT_FOUND, "Gift card not found.");
    }

    // Verify the pin (adjust based on how the pin is stored and compared)
    // If the pin is hashed in the database, compare it using a hash function (e.g., bcrypt)
    if (giftCard.pin !== pin) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid PIN.");
    }

    // Check the status of the gift card
    if (giftCard.status == 'Blocked') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Gift card is not active.");
    }

    // Check if the gift card has already been redeemed
    if (giftCard.status === 'Redeemed') {
        throw new ApiError(httpStatus.BAD_REQUEST, "Gift card has already been redeemed.");
    }

    // Check if the gift card has expired
    const currentDate = new Date();
    if (currentDate > giftCard.expiryDate) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Gift card has expired and cannot be redeemed.");
    }

    // Redeem the gift card
    giftCard.status = 'Redeemed'; // Update the status to Redeemed
    giftCard.redeemedBy = userId; // Store the user ID who redeemed the gift card (if applicable)
    giftCard.redeemedDate = currentDate; // Optionally store the redemption date
    await giftCard.save(); // Save the updated gift card

    // Return relevant information after redemption
    return giftCard;
};

export {
    create,
    getAllGiftCards,
    getById,
    redeem
};
