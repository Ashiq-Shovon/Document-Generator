import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonList,
} from "@ionic/react";
import {
  trash,
  print,
  chevronDownCircleOutline,
  chevronUpCircleOutline,
} from "ionicons/icons";
import { Reorder } from "framer-motion";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import notesItem from "../utils/notes.json";
import "./document.css";

const DocumentGenerator = () => {
  const [notes] = useState(notesItem.notes);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("asc");
  const [sections, setSections] = useState([]);
  const [editorContent, setEditorContent] = useState("");

  const handleSort = () => {
    setSort((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredNotes = notes
    .filter((note) => note.title.toLowerCase().includes(searchQuery))
    .sort((a, b) => {
      if (sort === "asc") {
        // First sort by category (A-Z), then title (A-Z)
        return (
          a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
        );
      } else {
        // First sort by category (Z-A), then title (Z-A)
        const categoryCompare = b.category.localeCompare(a.category);
        if (categoryCompare !== 0) return categoryCompare;
        return b.title.localeCompare(a.title);
      }
    });

  const groupedNotes = filteredNotes.reduce((groups, note) => {
    if (!groups[note.category]) groups[note.category] = [];
    groups[note.category].push(note);
    return groups;
  }, {});

  const generateHTMLFromContentList = (contentList) => {
    return contentList[0]?.body
      .map((item) => {
        switch (item.type) {
          case "title":
            return `<h2"><b>${item.text}</b></h2>`;
          case "header":
            return `<h2>${item.text}</h2>`;
          case "paragraph":
            return `<p>${item.text}</p>`;
          case "list":
            return `<ul>${item.items
              .map((li) => `<li>${li}</li>`)
              .join("")}</ul>`;
          default:
            return "";
        }
      })
      .join("");
  };

  const handleClick = (note) => {
    //check duplicate
    if (sections.some((s) => s.title === note.title)) return;
    const html = generateHTMLFromContentList(note.contentList);
    const newSection = { title: note.title, html };
    setSections((prev) => [...prev, newSection]);
  };



  const removeSection = (idx) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };


  useEffect(() => {
    const combinedHTML = sections.map((s) => s.html).join("");
    setEditorContent(combinedHTML);
  }, [sections]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Print</title></head>
        <body>${editorContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ textAlign: "center" }}>
            Guideline Document
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="full-layout">
          {/* Left Sidebar */}
          <div className="left-panel">
            <div className="left-half">
              {/* Sort Button */}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4>Available Notes</h4>
                <IonButton onClick={handleSort}>
                  <IonIcon
                    icon={
                      sort === "asc"
                        ? chevronDownCircleOutline
                        : chevronUpCircleOutline
                    }
                    slot="start"
                  />
                  Sort {sort === "asc" ? "A-Z" : "Z-A"}
                </IonButton>
              </div>
              <IonSearchbar
                debounce={500}
                onIonInput={(e) =>
                  setSearchQuery(e.detail.value?.toLowerCase() || "")
                }
              />
              <IonAccordionGroup>
                {Object.entries(groupedNotes).map(([category, notes], idx) => (
                  <IonAccordion value={category} key={idx}>
                    <IonItem slot="header" color="light">
                      <IonLabel>{category}</IonLabel>
                    </IonItem>
                    <div className="ion-padding" slot="content">
                      <IonList>
                        {notes.map((note, i) => (
                          <IonItem
                            key={i}
                            button
                            onClick={() => handleClick(note)}
                          >
                            <IonLabel>{note.title}</IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </div>
                  </IonAccordion>
                ))}
              </IonAccordionGroup>
            </div>

            <div className="left-half">
              <h4>Selected Sections</h4>
              <Reorder.Group
                axis="y"
                values={sections}
                onReorder={setSections}
                className="selected-list"
              >
                {sections.map((section, idx) => (
                  <Reorder.Item
                    key={section.title}
                    value={section}
        
                  >
                    <div className="section-item">
                      <span className="drag-handle">☰</span>
                      <span className="section-title">{section.title}</span>
                      <IonButton
                        size="small"
                        fill="clear"
                        color="danger"
                        onClick={() => removeSection(idx)}
                      >
                        <IonIcon icon={trash} />
                      </IonButton>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>

          {/* Right Editor Panel */}
          <div className="right-panel">
            <div className="editor-toolbar">
              <h3>Document Preview</h3>
              <IonButton onClick={handlePrint}>
                <IonIcon icon={print} slot="start" />
                Print
              </IonButton>
            </div>
            <ReactQuill
              value={editorContent}
              theme="snow"
              onChange={setEditorContent}
              style={{ height: "100%", backgroundColor: "white" }}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DocumentGenerator;
