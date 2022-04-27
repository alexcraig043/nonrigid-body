let nodes = []
let sticks = []
let nodeRadius = 17
let simulating = false
let drawingStick = false
let cuttingMode = false
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

// When mouse is pressed, runs logic for click event:
function mousePressed()
{
    clickLogic();
}

// Handles logic for click event. Either draws new Node and starts drawing temporary Stick, or connects Stick being drawn to an existing Node
function clickLogic()
{
    if (!cuttingMode) 
    {
        let clickedOnNode = false;
        for (let node of nodes)
        {
            // Get distance between click and nodes
            let d = dist(mouseX, mouseY, node.position.x, node.position.y)
    
            // If user clicks on/near an existing node:
            if (d < node.radius * 2)
            {
                if (!drawingStick)
                {
                    // If user is not currently drawing a Stick, then start drawing one from clicked on node
                    firstNode = node
                    drawingStick = true
                } 
                else 
                {
                    // If user is currently drawing a temporary Stick, then finish the Stick at the clicked node and starting drawing a new temporary Stick from clicked Node as long as an identical stick doesn't already exist
                    secondNode = node
                    if (!stickAlreadyExists(firstNode, secondNode))
                    {
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
    else 
    {
        // Remove the stick that click was closest too if click was close enough
        let minDist = Number.POSITIVE_INFINITY
        let minIdx = -1
        for (let stick of sticks)
        {
            // Get distance between click and stick
            let d = distClickToStick(mouseX, mouseY, stick)
            // Reset minDist and minIdx if needed
            if (abs(d) < abs(minDist)) 
            { 
                minDist = d
                minIdx = sticks.indexOf(stick)
            }
        }
        if (abs(minDist) <= 10)
        {
            sticks.splice(minIdx, 1)
        }
    }
}

function distClickToStick(mouseX, mouseY, stick) {
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
        nodes.push(new Node(pos, true, nodeRadius))
    } else
    {
        nodes.push(new Node(pos, false, nodeRadius))
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
    // Toggles cutting mode when x is pressed:
    if (keyCode == 88)
    {
        cuttingMode = !cuttingMode
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