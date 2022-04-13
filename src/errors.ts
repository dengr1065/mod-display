class APIError {
  name: string;
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  toJSON() {
    return {
      error: this.name,
      message: this.description
    };
  }
}

export const Errors = {
  NO_SUCH_MOD: new APIError("no_such_mod", "Failed to find the requested mod."),
  NO_MATCHING_VERSION: new APIError(
    "no_matching_version",
    "There are no versions of requested mod that match specified version."
  ),
  INVALID_VERSION: new APIError(
    "invalid_version",
    "The requested mod version range is not valid and cannot be resolved."
  ),
  INVALID_SCREENSHOT: new APIError(
    "invalid_screenshot",
    "The requested mod screenshot does not exist."
  ),
  MISSING_README: new APIError(
    "missing_readme",
    "This mod does not have a README metadata section."
  ),
  INVALID_ROUTE: new APIError(
    "invalid_route",
    "The requested API route does not exist."
  ),
  SERVER_ERROR: new APIError(
    "server_error",
    "The server failed to handle this request."
  )
};
