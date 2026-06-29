describe("responses controller", () => {
  describe("addResponse_controller", () => {
    test.todo(
      "calls addResponse_service with req.user.id, req.params.id, and req.validatedBody",
    );
    test.todo("returns 201 with the service result when a response is created");
    test.todo("forwards service errors to next");
  });

  describe("listResponses_controller", () => {
    test.todo("calls listResponses_model with req.user.id");
    test.todo("returns 404 when no responses are found (falsy model result)");
    test.todo("returns 200 with the response list when data is found");
    test.todo("forwards model errors to next");
  });
});
