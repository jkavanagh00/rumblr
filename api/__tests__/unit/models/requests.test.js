import testDb from "../../setup/testDb.js";
import {
  sendRumbleRequest_model,
  getRumbleRequestById_model,
  acceptRumbleRequest_model,
  declineRumbleRequest_model,
  getLatestDeclinedRumbleRequest_model,
  findPendingRumbleRequestBetweenUsers_model,
} from "../../../src/models/requests.js";

describe("requests model", () => {
  describe("sendRumbleRequest_model", () => {
    test.todo(
      "inserts a new rumble request with requester_id, receiver_id, and threat_level",
    );
    test.todo("defaults status to pending for new requests");
    test.todo("returns the knex insert response for the created request");
    test.todo("uses the provided transaction object when trx is passed");
  });

  describe("getRumbleRequestById_model", () => {
    test.todo("returns the matching rumble request for a valid id");
    test.todo("returns undefined when no request exists for the provided id");
    test.todo("uses the provided transaction object when trx is passed");
  });

  describe("acceptRumbleRequest_model", () => {
    test.todo(
      "updates status to accepted when the request exists and is pending",
    );
    test.todo("returns 0 when request does not exist");
    test.todo("returns 0 when request exists but status is not pending");
    test.todo("uses the provided transaction object when trx is passed");
  });

  describe("declineRumbleRequest_model", () => {
    test.todo("updates status to declined for an existing request id");
    test.todo("sets declined_at when a pending request is declined");
    test.todo("returns 0 when request does not exist");
    test.todo("uses the provided transaction object when trx is passed");
  });

  describe("getLatestDeclinedRumbleRequest_model", () => {
    test.todo(
      "returns the most recent declined_at value for the same requester/receiver pair",
    );
    test.todo(
      "returns undefined when the pair has no declined requests with declined_at set",
    );
    test.todo(
      "does not return declined requests from other requester/receiver pairs",
    );
    test.todo("uses the provided transaction object when trx is passed");
  });

  describe("findPendingRumbleRequestBetweenUsers_model", () => {
    test.todo(
      "returns the pending request for requester/receiver when the same threat_level exists",
    );
    test.todo(
      "returns undefined when no pending request exists for that requester/receiver threat_level combination",
    );
    test.todo(
      "ignores non-pending requests for the same requester/receiver pair",
    );
    test.todo("uses the provided transaction object when trx is passed");
  });
});
