const DragSystem = (() => {
  const attachDrag = (
    dragHolder,
    dragElements,
    direction,
    callback,
    parameters,
  ) => {
    // get all current drag elements
    let activeDragElements = dragHolder.querySelectorAll(
      ":scope > " + dragElements,
    );
    let isPairedWithDrag = new WeakSet();
    let currentlyDragging = null;
    let activeVisualBox = null,
      lastClosestElement = null,
      lastClosestOuterElement = null,
      lastAlignment = null;

    let initialWidth = 0,
      initialHeight = 0;
    let startX = 0,
      startY = 0;

    let innerElement = parameters && parameters.innerElement;

    const dragObserver = (dragElement, isInnerElement) => {
      if (isPairedWithDrag.has(dragElement)) {
        return;
      }
      isPairedWithDrag.add(dragElement);

      if (!innerElement || !parameters?.ignoreOuterDragging || isInnerElement) {
        document.addEventListener("pointerdown", (event) => {
          if (currentlyDragging != null) {
            return;
          }

          if (
            event.target !=
            (!isInnerElement
              ? parameters && parameters.attachElement
                ? dragElement.querySelector(parameters.attachElement)
                : dragElement
              : parameters &&
                  parameters.useAttachForInner &&
                  parameters.attachElement
                ? dragElement.querySelector(parameters.attachElement)
                : dragElement)
          ) {
            return;
          }

          const targetHandle = event.target;
          targetHandle.setPointerCapture(event.pointerId);

          dragElement.style.touchAction = "none";
          dragElement.style.pointerEvents = "none";

          startX = event.clientX;
          startY = event.clientY;

          event.preventDefault();

          currentlyDragging = dragElement;

          initialWidth = dragElement.getBoundingClientRect().width;
          initialHeight = dragElement.getBoundingClientRect().height;
        });

        document.addEventListener("pointermove", (event) => {
          if (currentlyDragging != dragElement) return;

          event.preventDefault();
          event.stopPropagation();

          if (Math.hypot(event.clientX - startX, event.clientY - startY) < 5)
            return;

          dragElement.style.transition = "none";
          dragElement.style.position = "fixed";
          dragElement.style.touchAction = "none";
          dragElement.style.zIndex = "100";
          dragElement.style.pointerEvents = "none";
          dragElement.style.userSelect = "none";
          dragElement.style.cursor = "grabbing";
          dragElement.style.left = `${event.clientX}px`;
          dragElement.style.top = `${event.clientY}px`;
          dragElement.style.width = `${initialWidth}px`;
          dragElement.style.height = `${initialHeight}px`;

          let targetContainer = dragHolder;

          if (isInnerElement) {
            let closestContainer = null;
            let minContainerDist = Math.min();

            for (const containerCandidate of dragHolder.querySelectorAll(
              ":scope > " + dragElements,
            )) {
              const rect = containerCandidate.getBoundingClientRect();
              const isInside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;

              if (isInside) {
                closestContainer = containerCandidate;
                break;
              }

              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const dist = Math.hypot(
                event.clientX - centerX,
                event.clientY - centerY,
              );

              if (dist < minContainerDist) {
                minContainerDist = dist;
                closestContainer = containerCandidate;
              }
            }

            targetContainer = closestContainer || dragHolder;

            if (parameters.innerTargetContainer) {
              targetContainer = targetContainer.querySelector(
                parameters.innerTargetContainer,
              );
            }

            lastClosestOuterElement = targetContainer;
          } else {
            lastClosestOuterElement = null;
          }

          const targetSelector = isInnerElement ? innerElement : dragElements;
          const targetChildren = targetContainer.querySelectorAll(
            ":scope > " + targetSelector,
          );

          let closestChild = null;
          let minChildDist = Infinity;

          for (const childCandidate of targetChildren) {
            if (childCandidate === dragElement) continue;

            const rect = childCandidate.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.hypot(
              event.clientX - centerX,
              event.clientY - centerY,
            );

            if (dist < minChildDist) {
              minChildDist = dist;
              closestChild = childCandidate;
            }
          }

          if (!closestChild) {
            if (activeVisualBox) {
              activeVisualBox.remove();
              activeVisualBox = null;
            }

            activeVisualBox = document.createElement("div");
            activeVisualBox.classList.add("visual-box");
            activeVisualBox.style.width = `${initialWidth}px`;
            activeVisualBox.style.height = `${initialHeight}px`;

            targetContainer.appendChild(activeVisualBox);
            return;
          }

          const currentDirection = isInnerElement
            ? parameters && parameters.innerDirection
            : direction;

          const closestRect = closestChild.getBoundingClientRect();
          let alignment = "";

          if (currentDirection === "vertical") {
            alignment =
              event.clientY < closestRect.top + closestRect.height / 2
                ? "top"
                : "bottom";
          } else {
            alignment =
              event.clientX < closestRect.left + closestRect.width / 2
                ? "left"
                : "right";
          }

          if (
            closestChild === lastClosestElement &&
            alignment === lastAlignment
          ) {
            return;
          }

          if (activeVisualBox) {
            activeVisualBox.remove();
          }

          lastClosestElement = closestChild;
          lastAlignment = alignment;

          activeVisualBox = document.createElement("div");
          activeVisualBox.classList.add("visual-box");
          activeVisualBox.style.width = `${initialWidth}px`;
          activeVisualBox.style.height = `${initialHeight}px`;

          if (alignment === "left" || alignment === "top") {
            targetContainer.insertBefore(activeVisualBox, closestChild);
          } else {
            targetContainer.insertBefore(
              activeVisualBox,
              closestChild.nextSibling,
            );
          }
        });

        const pointerUp = (event) => {
          if (currentlyDragging != dragElement) {
            return;
          }

          const targetHandle =
            parameters && parameters.attachElement
              ? dragElement.querySelector(parameters.attachElement)
              : dragElement;

          if (targetHandle) {
            targetHandle.releasePointerCapture(event.pointerId);
          }

          if (Math.hypot(event.clientX - startX, event.clientY - startY) < 5) {
            if (currentlyDragging.tagName === "BUTTON") {
              currentlyDragging.click();
            }

            currentlyDragging = null;
            return;
          }

          currentlyDragging = null;
          event.preventDefault();

          dragElement.style.position = "";
          dragElement.style.zIndex = "";
          dragElement.style.pointerEvents = "";
          dragElement.style.touchAction = "";
          dragElement.style.userSelect = "";
          dragElement.style.cursor = "";
          dragElement.style.left = "";
          dragElement.style.top = "";
          dragElement.style.width = "";
          dragElement.style.height = "";

          const dragRect = dragElement.getBoundingClientRect();
          const holderRect = dragHolder.getBoundingClientRect();
          if (
            dragRect.top < holderRect.top ||
            dragRect.left < holderRect.left
          ) {
            return;
          }

          if (isInnerElement) {
            let oldRowIndex = -1,
              oldColIndex = -1;
            let newRowIndex = -1,
              newColIndex = -1;

            const rows = Array.from(
              dragHolder.querySelectorAll(":scope > " + dragElements),
            );

            for (let r = 0; r < rows.length; r++) {
              const cols = Array.from(
                rows[r].querySelectorAll(
                  ":scope > " +
                    (parameters && parameters.innerTargetContainer
                      ? parameters.innerTargetContainer + " "
                      : "") +
                    innerElement +
                    ", .visual-box",
                ),
              );

              for (let c = 0; c < cols.length; c++) {
                const item = cols[c];

                if (item === dragElement) {
                  oldRowIndex = r;
                  oldColIndex = c;
                  if (newColIndex != -1 && oldRowIndex == newRowIndex) {
                    oldColIndex--;
                  }
                }

                if (item === activeVisualBox) {
                  newRowIndex = r;
                  newColIndex = c;
                  if (oldColIndex != -1 && oldRowIndex == newRowIndex) {
                    newColIndex--;
                  }
                }
              }
            }

            let lastActiveBox = activeVisualBox;

            if (activeVisualBox) {
              activeVisualBox.remove();
              activeVisualBox = null;
            }

            lastClosestOuterElement = null;
            lastClosestElement = null;
            lastAlignment = null;

            if (parameters && parameters.callbackElements) {
              callback(
                oldRowIndex,
                newRowIndex,
                oldColIndex,
                newColIndex,
                parameters.callbackElements(dragElement, lastActiveBox),
              );
            } else {
              callback(oldRowIndex, newRowIndex, oldColIndex, newColIndex);
            }
          } else {
            let oldIndex = -1,
              newIndex = -1;

            let elems = dragHolder.querySelectorAll(
              ":scope > " + dragElements + ", .visual-box",
            );

            for (let col = 0; col < elems.length; col++) {
              const item = elems[col];
              if (item === dragElement) {
                oldIndex = col;
                if (newIndex != -1) {
                  oldIndex--;
                }
              }
              if (item === activeVisualBox) {
                newIndex = col;
                if (oldIndex != -1) {
                  newIndex--;
                }
              }
            }

            let lastActiveBox = activeVisualBox;

            if (activeVisualBox) {
              activeVisualBox.remove();
              activeVisualBox = null;
            }

            lastClosestOuterElement = null;
            lastClosestElement = null;
            lastAlignment = null;

            if (parameters && parameters.callbackElements) {
              callback(
                oldIndex,
                newIndex,
                parameters.callbackElements(dragElement, lastActiveBox),
              );
            } else {
              callback(oldIndex, newIndex);
            }
          }
        };

        document.addEventListener("pointerup", pointerUp);
        document.addEventListener("pointercancel", pointerUp);
      }

      if (innerElement) {
        for (const elem of dragElement.querySelectorAll(
          ":scope > " +
            (parameters && parameters.innerTargetContainer
              ? parameters.innerTargetContainer + " "
              : "") +
            innerElement,
        )) {
          dragObserver(elem, true);
        }

        const observer = new MutationObserver(() => {
          for (const elem of dragElement.querySelectorAll(
            ":scope > " +
              (parameters && parameters.innerTargetContainer
                ? parameters.innerTargetContainer + " "
                : "") +
              innerElement,
          )) {
            dragObserver(elem, true);
          }
        });
        observer.observe(dragElement, { childList: true, subtree: false });
      }
    };

    const observer = new MutationObserver(() => {
      activeDragElements = dragHolder.querySelectorAll(
        ":scope > " + dragElements,
      );
      activeDragElements.forEach((elem) => dragObserver(elem, false));
    });
    observer.observe(dragHolder, { childList: true, subtree: false });

    activeDragElements.forEach((elem) => dragObserver(elem, false));
  };

  return {
    attachDrag,
  };
})();
