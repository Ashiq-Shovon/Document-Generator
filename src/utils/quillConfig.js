import Quill from "quill";

// Extend Container so it can hold nested blocks or inlines
const Container = Quill.import("blots/container");
const Block = Quill.import("blots/block");

// Custom SectionBlock that supports nesting and a `data-section` attribute
class SectionBlock extends Block {
  static create(value) {
    const node = super.create();
    if (value) {
      node.setAttribute("data-section", value);
    }
    return node;
  }

  static formats(node) {
    return node.getAttribute("data-section");
  }

  format(name, value) {
    if (name === "data-section") {
      if (value) {
        this.domNode.setAttribute("data-section", value);
      } else {
        this.domNode.removeAttribute("data-section");
      }
    } else {
      super.format(name, value);
    }
  }
}

SectionBlock.blotName = "sectionBlock";
SectionBlock.tagName = "div";
SectionBlock.className = "ql-section"; // optional

Quill.register(SectionBlock, true);
