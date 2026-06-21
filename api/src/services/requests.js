import db from "../database/db.js";
import { acceptRumbleRequest_model, checkForPendingRumbleRequest_model } from "../models/requests.js";
import { addRumble_model } from "../models/rumbles.js";

export async function acceptRumbleRequest_service(data) {
    const transaction = await db.transaction(async (trx) => {
        const updatedRows = await acceptRumbleRequest_model(data.rumble_request_id, trx);

        if (updatedRows < 1) {
            throw new Error("No pending rumble request found");
        } 
        const rumble = await addRumble_model(data, trx);
        return {
            rumbleRequest,
            rumble,
        }
    });
    return transaction;
}