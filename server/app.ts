import LabelingConcept from "./concepts/labeling";
import AuthenticatingConcept from "./concepts/authenticating";
import PostingConcept from "./concepts/posting";
import SessioningConcept from "./concepts/sessioning";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
// TODO 8: add Labeling to our app
export const Labeling = new LabelingConcept("labels");
