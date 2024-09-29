
import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

export interface LabelDoc extends BaseDoc {
  // TODO 4: what state is stored for each label of the Labeling concept?
  creator: ObjectId;
  name: string;
  items: Array<ObjectId>;
}

/**
 * concept: Labeling [Creator, Item]
 */
export default class LabelingConcept {
  public readonly labels: DocCollection<LabelDoc>;

  /**
   * Make an instance of Labeling.
   */
  constructor(collectionName: string) {
    this.labels = new DocCollection<LabelDoc>(collectionName);
  }

  async create(creator: ObjectId, name: string) {
    // TODO 5: creating a label
    // const _id = assert.fail("Not implemented!");
    const _id = await this.labels.createOne({creator, name, items: []})
    return { msg: `Label ${name} successfully created!`, label: await this.labels.readOne({ _id }) };
  }

  async getByCreator(creator: ObjectId) {
    // TODO 6: finding labels
    const labels = await this.labels.readMany({creator});
    // const labels = assert.fail("Not implemented!");
    return { msg: "Here are your labels!", labels };
  }

  async affix(label: ObjectId, item: ObjectId) {
    // TODO 7: labeling an item
    const labeldoc = await this.labels.readOne({ _id: label});
    if (labeldoc === null) {
      throw new NotFoundError("No such label");
    }
    if (labeldoc.items.some((id) => id.equals(item))) {
      throw new BadValuesError("item already has a label!")
    }
    await this.labels.partialUpdateOne({_id: label}, {items: labeldoc.items.concat(item)});
    //throw new Error("Not implemented!");
  }

  async assertCreatorIsUser(_id: ObjectId, user: ObjectId) {
    // TODO not in recitation today :)
    const label = await this.labels.readOne({ _id });
    if (!label) {
      throw new NotFoundError(`Label ${_id} does not exist!`);
    }
    if (label.creator.toString() !== user.toString()) {
      throw new Error(`${user} is not the creator of label ${_id} :(`);
    }
  }
    //  - see Posting.assertAuthorIsUser
    //  - consider how to keep things both DRY and modular
}

