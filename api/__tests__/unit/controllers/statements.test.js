describe("statements controller", () => {
  describe("getStatementWithNoResponse_controller", () => {
    test.todo("calls getStatementWithNoResponse_model with req.user.id");
    test.todo("returns 204 when no unanswered statement exists");
    test.todo("returns 200 with the unanswered statement when found");
    test.todo("forwards model errors to next");
  });

  describe("addStatement_controller", () => {
    test.todo("calls addStatement_model with req.validatedBody");
    test.todo("returns 201 with the created statement");
    test.todo("forwards model errors to next");
  });

  describe("getStatementById_controller", () => {
    test.todo("calls getStatementById_model with req.params.id");
    test.todo("returns 404 when statement is not found");
    test.todo("returns 200 with the statement when found");
    test.todo("forwards model errors to next");
  });

  describe("listStatements_controller", () => {
    test.todo("calls listStatements_model with no arguments");
    test.todo("returns 200 with the statements list");
    test.todo("forwards model errors to next");
  });

  describe("updateStatement_controller", () => {
    test.todo("calls getStatementById_model with req.params.id before update");
    test.todo("returns 404 when statement is not found for update");
    test.todo("calls updateStatement_model with req.params.id and req.validatedBody");
    test.todo("returns 200 with the updated statement");
    test.todo("forwards model errors to next");
  });

  describe("deleteStatement_controller", () => {
    test.todo("calls getStatementById_model with req.params.id before deletion");
    test.todo("returns 404 when statement is not found for deletion");
    test.todo("calls deleteStatement_model with req.params.id");
    test.todo("returns 200 with the deleted statement");
    test.todo("forwards model errors to next");
  });
});
