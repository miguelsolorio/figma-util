figma.on("run", () => {

  const selection = figma.currentPage.selection;

  // ========================
  // Add Auto Layout
  // ========================
  if (figma.command === "add-auto-layout") {

    // Iterate through each selected node
    for (const node of selection) {
      if ("layoutMode" in node) {  // Check if the node can have auto layout
        node.layoutMode = 'VERTICAL';  // Change this to 'HORIZONTAL' if you prefer
        node.primaryAxisSizingMode = 'AUTO';
        node.counterAxisSizingMode = 'AUTO';
        node.paddingLeft = 0;
        node.paddingRight = 0;
        node.paddingTop = 0;
        node.paddingBottom = 0;
        node.itemSpacing = 0;
      }
    }
  }

  // ========================
  // Add States
  // ========================
  if (figma.command === "add-states") {

    if (selection.length < 1 ) {
      figma.notify('Please select one frame or component to apply states to.');
      return
    }


    let buttonComponent: ComponentNode;
    const buttonName = selection[0].name;
    const buttonPosX = selection[0].x;
    const buttonPosY = selection[0].y;

    // Check if the selection is a component or a frame
    if (selection[0].type === 'FRAME') {
      const frameNode = selection[0] as FrameNode;
      // Convert the frame to a component
      buttonComponent = figma.createComponent();
      buttonComponent.resizeWithoutConstraints(frameNode.width, frameNode.height);
      buttonComponent.x = frameNode.x;
      buttonComponent.y = frameNode.y;
      buttonComponent.name = frameNode.name;

      if (frameNode.children.length === 1 && frameNode.type === 'FRAME') {
        console.log('Remove single frame')
        const innerFrame = frameNode as FrameNode;
        // Copy properties from the inner frame to the component
        buttonComponent.resizeWithoutConstraints(innerFrame.width, innerFrame.height);
        buttonComponent.fills = innerFrame.fills;
        buttonComponent.strokes = innerFrame.strokes;
        buttonComponent.strokeWeight = innerFrame.strokeWeight;
        buttonComponent.cornerRadius = innerFrame.cornerRadius;
        buttonComponent.paddingLeft = innerFrame.paddingLeft;
        buttonComponent.paddingRight = innerFrame.paddingRight;
        buttonComponent.paddingTop = innerFrame.paddingTop;
        buttonComponent.paddingBottom = innerFrame.paddingBottom;
        buttonComponent.itemSpacing = innerFrame.itemSpacing;

        // Correctly move children from inner frame to the component
        const children = innerFrame.children.slice(); // Clone the children array to safely iterate
        children.forEach(child => buttonComponent.appendChild(child));

        // Move children from inner frame to the component
        // while (innerFrame.children.length > 0) {
        buttonComponent.appendChild(innerFrame);
        // }
        // // Remove the inner frame
        innerFrame.remove();
      } else {
        buttonComponent.appendChild(frameNode);
      }
      console.log('Frame converted to component.');
    } else if (selection[0].type === 'COMPONENT') {
      buttonComponent = selection[0] as ComponentNode;
      console.log('Selection is already a component.');
    } else {
      figma.notify('Please select a frame or component.');
      return;
    }

    // Create component set if it's not already a component set
    let componentSet: ComponentSetNode | null = null;
    if (buttonComponent.parent?.type === 'COMPONENT_SET') {
      componentSet = buttonComponent.parent as ComponentSetNode;
    } else {
      componentSet = figma.combineAsVariants([buttonComponent], figma.currentPage);
      figma.notify('Component converted to component set.');
    }

    // Rename prop name
    buttonComponent.name = "States=Default";

    // Add auto layout to button component
    buttonComponent.layoutMode = 'HORIZONTAL';
    buttonComponent.layoutSizingHorizontal = 'HUG';
    buttonComponent.layoutSizingVertical = 'HUG';

    // Add auto layout to the component set
    componentSet.name = buttonName;
    componentSet.layoutMode = 'VERTICAL';
    componentSet.horizontalPadding = 8;
    componentSet.verticalPadding = 8;
    componentSet.itemSpacing = 8;
    componentSet.layoutSizingHorizontal = 'HUG';

    // Apply purple border to componentSet #9747FF
    componentSet.strokes = [{ type: 'SOLID', color: { r: 0.592, g: 0.278, b: 1 }, blendMode: 'NORMAL', opacity: 1 }];
    componentSet.strokeWeight = 1;

    // Create the states as variants
    const hoverVariant = buttonComponent.clone();
    const activeVariant = buttonComponent.clone();
    const disabledVariant = buttonComponent.clone();

    // Set names for the variants
    hoverVariant.name = 'States=Hover';
    activeVariant.name = 'States=Active';
    disabledVariant.name = 'States=Disabled';

    // Append the variants to the component set
    componentSet.appendChild(hoverVariant);
    componentSet.appendChild(activeVariant);
    componentSet.appendChild(disabledVariant);

    // Set the properties to show/hide the variants based on the state
    hoverVariant.setPluginData('State', 'HOVER');
    activeVariant.setPluginData('State', 'ACTIVE');
    disabledVariant.setPluginData('State', 'DISABLED');

    // Center the component set in the viewport
    componentSet.x = buttonPosX;
    componentSet.y = buttonPosY;

    // figma.viewport.scrollAndZoomIntoView([componentSet]);
    figma.notify('Button component with states created successfully!');
  }

  figma.closePlugin();
});