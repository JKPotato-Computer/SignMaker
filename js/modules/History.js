// The Most Efficient Undo / Redo System
// citations: Me
const HistoryManager = (() => {
  let undoStack = [];
  let redoStack = [];

  const createSnapshot = (postState) => {
    return {
      fileData: ImportExport.signToJson(postState, "post"),
      variableStates: App.getHistoryVars(),
    };
  };

  const applySnapshot = (snapshot) => {
    const parsedSnapshot =
      typeof snapshot === "string" ? { fileData: snapshot } : snapshot;

    App.setPost(ImportExport.jsonToSign(parsedSnapshot.fileData));
    App.setHistoryVars(parsedSnapshot.variableStates);
    formHandler.updateForm();
    App.redraw();
  };

  const updateButtons = () => {
    const undoButton = document.querySelector("#undoButton");
    const redoButton = document.querySelector("#redoButton");

    if (undoButton) {
      undoButton.disabled = undoStack.length === 0;
    }
    if (redoButton) {
      redoButton.disabled = redoStack.length === 0;
    }
  };

  const addToUndoStack = (postState) => {
    undoStack.push(createSnapshot(postState));
    redoStack.length = 0;
    updateButtons();
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack.pop();
      redoStack.push(createSnapshot(App.getPost()));
      applySnapshot(lastState);

      updateButtons();
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const lastState = redoStack.pop();
      undoStack.push(createSnapshot(App.getPost()));
      applySnapshot(lastState);

      updateButtons();
    }
  };

  return {
    addToUndoStack,
    undo,
    redo,
    updateButtons,
  };
})();
