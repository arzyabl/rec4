import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Labeling, Posting, Sessioning } from "./app";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.post("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts() {
    return await Posting.getPosts();
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    return await Posting.create(user, content, options);
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    // Implementation for TODO 3: delete the post with the given ID
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  // TODO 9: add routes to (1) create a label, (2) get the user's labels, and (3) label a post
  @Router.post('/labels') 
  async createLabel(session: SessionDoc, name: string) {
    const user = Sessioning.getUser(session);
    return Labeling.create(user,name);
  }

  @Router.get('/labels')
  async getLabels(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return Labeling.getByCreator(user);
  }

  @Router.post("/labels/:labelid/posts/:postid") 
  async affixLabelToPost(session:SessionDoc, labelid: string, postid: string) {
    const user = Sessioning.getUser(session);
    const labelOid = new ObjectId(labelid);
    // assertCreatorIsUser was not implemented in recitaiton so I'm leaving it commented out in the solutions
    // in order to not throw any errors, but in reality, we should assert that the current logged in
    // user is the creator of the label before allowing the user to affix the label to an item. 
    // await Labeling.assertCreatorIsUser(labelOid, user);   
    const postOid = new ObjectId(postid);
    await Posting.assertAuthorIsUser(postOid, user);
    return Labeling.affix(labelOid, postOid);
  }

}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
