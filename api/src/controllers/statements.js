/*
all controllers related to statements should be here

examples:

- getUnansweredStatement
- submitAnswer
- addStatement?
*/

import { z } from "zod";
import db from "../database/db.js";

import {
  addStatement_model,
  getStatementById_model,
  listStatements_model,
  updateStatement_model,
  deleteStatement_model,
  upsertResponse_model,
  listResponses_model,
  getStatementWithNoResponse_model,
  addResponse_model,
} from "../models/statements.js";
import { upsertMismatch, fetchSharedResponses } from "../models/mismatches.js";

export async function getStatementWithNoResponse_controller(req, res, next) {
  try {
    const statement = await getStatementWithNoResponse_model(req.user.id);

    if (!statement) {
      return res.status(204).json({
        error:
          "You have responded to all of our statements! Maybe go and touch grass?",
      });
    }

    return res.status(200).json(statement);
  } catch (error) {
    next(error);
  }
}

export async function addStatement_controller(req, res, next) {
  try {
    const statement = await addStatement_model(req.validatedBody);
    return res.status(201).json(statement);
  } catch (error) {
    next(error);
  }
}

export async function getStatementById_controller(req, res, next) {
  try {
    const id = req.params.id;
    const statement = await getStatementById_model(id);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    return res.status(200).json(statement);
  } catch (error) {
    next(error);
  }
}

export async function addResponse_controller(req, res, next) {
  try {
    const statementId = req.params.id;
    const userId = req.user.id;
    const payload = {
      questionId,
      userId,
      agreement_score: req.validatedBody.agreement_score,
      importance_score: req.validatedBody.importance_score,
    };
    const statement = await getStatementById_model(statementId);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    const response = await addResponse_model(payload);
    return res
      .status(201)
      .json({ message: "Response submitted successfully", response });
  } catch (error) {
    next(error);
  }
}

export async function listResponses_controller(req, res, next) {
  try {
    const responses = await listResponses_model(req.user.id);

    if (!responses) {
      return res.status(404).json({ error: "No responses found" });
    }

    return res.status(200).json(responses);
  } catch (error) {
    next(error);
  }
}

export async function listStatements_controller(req, res, next) {
  try {
    const statements = await listStatements_model();
    return res.status(200).json(statements);
  } catch (error) {
    next(error);
  }
}

export async function updateStatement_controller(req, res, next) {
  try {
    const statement = await getStatementById_model(req.params.id);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }
    const updatedStatement = await updateStatement_model(req.params.id, req.validatedBody);
    return res.status(200).json(updatedStatement);
  } catch (error) {
    next(error);
  }
}

export async function deleteStatement_controller(req, res, next) {
  try {
    const statement = await getStatementById_model(req.params.id);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }
    const deletedStatement = await deleteStatement_model(req.params.id);
    return res.status(200).json(deletedStatement);
    } catch (error) {
    next(error);
  }
}
