let nodes = []
let sticks = []
let nodeRadius = 17
let simulating = false
let drawingStick = false
let currMoving = false
let movedNode
let cuttingMode = false
let drawingMode = true
let firstNode, secondNode
let k = .05 // Spring Coefficient
let c = .75 // Spring Damping Coefficient
let gravityStrength = .7

function setup()
{
    createCanvas(windowWidth, windowHeight)
    angleMode(DEGREES)
}

function draw()
{
    clear()
    background(51)
    
    drawElements();

    if (simulating)
    {
        simulatePhysics();
    }
    if (currMoving)
    {
        dragNode(movedNode)
    }
}

// Handles physics simulations of gravity onto Nodes and spring force of Sticks onto Nodes
function simulatePhysics()
{
    for (let node of nodes)
    {
        node.gravityForce(gravityStrength)
    }

    for (let stick of sticks)
    {
        stick.springForce()
    }
}

// Draws all Elements
function drawElements()
{
    if(drawingStick)
    {
        drawTempStick(firstNode)
    }

    for (let stick of sticks)
    {
        stick.show()
    }

    for (let node of nodes)
    {
        node.show()
    }
}

// Clears Elements
function clearAll()
{
    let numNodes = nodes.length
    let numSticks = sticks.length
    for (let i = 0; i < numNodes; i++)
    {
        nodes.pop()
    }
    for (let i = 0; i < numSticks; i++)
    {
        sticks.pop()
    }
}

// When mouse is released, stop moving node
function mouseReleased()
{
    currMoving = false
}

// When mouse is clicked, runs logic for click event:
function mousePressed()
{
    clickLogic();
}

// Cuts sticks when mouse is dragged
function mouseDragged()
{
    if (cuttingMode)
    {
        cutSticks()
    }
}

// Handles logic for click event. Either draws new Node and starts drawing temporary Stick, or connects Stick being drawn to an existing Node
function clickLogic()
{
    if (drawingMode)
    {
        let clickedOnNode = false;
        for (let node of nodes)
        {
            // Get distance between click and nodes
            const d = dist(mouseX, mouseY, node.position.x, node.position.y)
    
            // If user clicks on/near an existing node:
            if (d < node.radius * 2)
            {
                if (!drawingStick)
                {
                    // If user is not currently drawing a Stick, then start drawing one from clicked on node
                    // playSound('assets/rope.mov', true)
                    firstNode = node
                    drawingStick = true
                } 
                else 
                {
                    // If user is currently drawing a temporary Stick, then finish the Stick at the clicked node and starting drawing a new temporary Stick from clicked Node as long as an identical stick doesn't already exist
                    secondNode = node
                    if (!stickAlreadyExists(firstNode, secondNode))
                    {
                        // playSound('assets/rope.mov', true)
                        newStick(firstNode, secondNode)
                        firstNode = secondNode
                    }
                }
                clickedOnNode = true
            }
        }
    
        // If user didn't click on existing node and is not drawing a temporary Stick, then make a new Node
        if (!clickedOnNode && !drawingStick)
        {
            newNode(mouseX, mouseY)
        }
    }

    else if (movingMode)
    {
        for (let node of nodes)
        {
            if (clickedOnNode(node) && !currMoving)
            {
                currMoving = true
                movedNode = node
            }
        }
    }
}

function dragNode(node)
{
    node.position.x = mouseX
    node.position.y = mouseY
}

function clickedOnNode(node) {
    // Get distance between click and nodes
    const d = dist(mouseX, mouseY, node.position.x, node.position.y)
    if (d < node.radius * 2) return true
}

// Cuts sticks that the mouse passes over
function cutSticks()
{
    for (let stick of sticks)
    {
        const d = abs(distClickToStick(stick))
        // Check if curr mouse pos is on line
        if (d <= 10)
        {
            // Check if mouse is within bounds of segment
            if (stick.nodeA.position.x - 10 < mouseX && mouseX < stick.nodeB.position.x + 10 || stick.nodeB.position.x - 10 < mouseX && mouseX < stick.nodeA.position.x + 10)
            {
                if (stick.nodeA.position.y - 10 < mouseY && mouseY < stick.nodeB.position.y + 10 || stick.nodeB.position.y - 10 < mouseY && mouseY < stick.nodeA.position.y + 10)
                {
                    // Delete stick
                    playSound('assets/cut.mp3', false)
                    idx = sticks.indexOf(stick)
                    sticks.splice(idx, 1)
                }
            }
        }
    }
}

function distClickToStick(stick) {
    let lineVector = createVector(stick.nodeA.position.x - stick.nodeB.position.x, stick.nodeA.position.y - stick.nodeB.position.y)
    let nodeToMouseVector = createVector(stick.nodeA.position.x - mouseX, stick.nodeA.position.y - mouseY)
    let crossProduct = lineVector.cross(nodeToMouseVector);
    let dist = crossProduct.z / (mag(lineVector.x, lineVector.y))
    return dist
}

// If an identical Stick doesn't already exist, the generates a new Stick and appends it to the Sticks array:
function newStick(firstNode, secondNode)
{
    sticks.push(new Stick(firstNode, secondNode, k))
}

// Checks for identical Stick:
function stickAlreadyExists(a, b)
{
    for (let stick of sticks)
    {
        if (stick.nodeA == a && stick.nodeB == b || stick.nodeA == b && stick.nodeB == a)
        {
            return true
        }
    }
}

// Generates a new Node and appends it to the Nodes array, also handles logic of whether new Node is fixed:
function newNode(x, y)
{
    let pos = createVector(x, y)
    if (keyIsDown(SHIFT))
    {
        playSound('assets/fixedPop.mp3', false)
        nodes.push(new Node(pos, true, nodeRadius))
    } else
    {
        playSound('assets/pop.mp3', false)
        nodes.push(new Node(pos, false, nodeRadius))
    }
}

function playSound(file, isRope)
{
    var sound = document.createElement('audio')
    sound.src = file
    document.body.appendChild(sound)

    sound.play()

    sound.onended = function () {
        this.parentNode.removeChild(this);
    }
  

}

// Draws a temporary Stick from previously clicked Node to current mouse position:
function drawTempStick(fromNode)
{
    stroke('#fffafa')
    strokeWeight(2)
    line(fromNode.position.x, fromNode.position.y, mouseX, mouseY)
}

// Handles functionality of certain key-binds:
function keyPressed()
{
    // Stops drawing a temporary Stick when escape is pressed:
    if (keyCode == 27)
    {
        drawingStick = false
    }
    // Toggles physics simulation when Space is pressed:
    if (keyCode == 32)
    {
        simulating = !simulating
    }
    // Engages drawing mode when d is pressed:
    if (keyCode == 68)
    {
        cuttingMode = false
        drawingMode = true
        currMoving = false
    }
    // Engages cutting mode when m is pressed:
    if (keyCode == 77)
    {
        cuttingMode = false
        drawingMode = false
        movingMode = true
        drawingStick = false
    }
    // Engages cutting mode when x is pressed:
    if (keyCode == 88)
    {
        cuttingMode = true
        drawingMode = false
        movingMode = false
        drawingStick = false
    }
    // Clears everything when c is pressed:
    if (keyCode == 67)
    {
        clearAll()
    }
}

// Re-runs setup() when window is resized:
function windowResized()
{
    setup();
}