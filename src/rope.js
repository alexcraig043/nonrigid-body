class Node
{
    constructor(pos, lock, rad)
    {
        this.velocity = createVector(0,0)
        this.position = createVector(pos.x, pos.y)
        this.locked = lock
        this.radius = rad
    }

    show()
    {
        strokeWeight(0)
        if (!this.locked)
        {
            fill('#fffafa') 
        } 
        else
        {
            fill('#e65a5a')        
        }
        circle(this.position.x, this.position.y, this.radius * 2)
    }

    // Handles the gravity in physics sim - Sticks can be assumed as massless so no gravity force on them
    gravityForce(g)
    {
        let gravityVector = createVector(0,g);
        this.updateNode(gravityVector)
    }

    // Dampens spring force based on damping coefficient
    dampenForce(dampingVector)
    {
        dampingVector.mult(c)
        this.updateNode(dampingVector)
    }

    // Adjusts acceleration, velocity, and position of Node when force is applied:
    updateNode(force)
    {
        if(!this.locked)
        {
            this.velocity.add(force.x, force.y)
            this.position.add(this.velocity)    
        }
    }
}

class Stick
{
    constructor(firstNode, secondNode, springConstant)
    {
        this.nodeA = firstNode
        this.nodeB = secondNode
        this.k = springConstant
        this.equilibrium = dist(this.nodeA.position.x, this.nodeA.position.y, this.nodeB.position.x, this.nodeB.position.y)
    }

    show()
    {
        stroke('#fffafa')
        strokeWeight(2)
        line(this.nodeA.position.x, this.nodeA.position.y, this.nodeB.position.x, this.nodeB.position.y)
    }

    // Finds spring force of Stick using Hooke's law, then applies spring force onto Nodes
    springForce()
    {
        // Use displacement and spring constant to calculate magnitude of spring force with Hooke's law
        let springForceMagnitude = -this.k * this.getDisplacement()

        // The magnitude of the x component of the spring force will be proportional to cos(theta), y component will be proportional to sin(theta)
        let theta = abs(this.getTheta())
        
        let springForceMagnitudeX = abs(springForceMagnitude * cos(theta))
        let springForceMagnitudeY = abs(springForceMagnitude * sin(theta))


        // If springForceMagnitude is positive, then Stick will pull Nodes together, if springForceMagnitude is negative, then Stick will push Nodes apart
        if (springForceMagnitude > 0)
        {
            // PULLING
            if (this.nodeA.position.x > this.nodeB.position.x)
            {
                springForceMagnitudeX *= -1
            }
            if (this.nodeA.position.y > this.nodeB.position.y)
            {
                springForceMagnitudeY *= -1
            }
        }
        if (springForceMagnitude < 0)
        {
            // PUSHING
            if (this.nodeA.position.x < this.nodeB.position.x)
            {
                springForceMagnitudeX *= -1
            }
            if (this.nodeA.position.y < this.nodeB.position.y)
            {
                springForceMagnitudeY *= -1
            }
        }

        // Sets force vector to x and y components of spring force
        let springForceVector = createVector(springForceMagnitudeX, springForceMagnitudeY)

        // Adjust acceleration, velocity, and position of Nodes
        this.nodeA.updateNode(springForceVector)
        this.nodeB.updateNode(springForceVector.mult(-1))

        // Dampen the spring force
        this.nodeA.dampenForce(springForceVector)
        this.nodeB.dampenForce(springForceVector.mult(-1))
    }

    // Returns the angle between Node A and Node B
    getTheta()
    {
        let theta = atan(this.getDistanceY() / this.getDistanceX())
        return theta    
    }

    // Returns the current displacement of Nodes compared to equilibrium
    getDisplacement()
    {
        let distBetweenNodes = dist(this.nodeA.position.x, this.nodeA.position.y, this.nodeB.position.x, this.nodeB.position.y)
        let displacement = this.equilibrium - distBetweenNodes
        return displacement
    }

    // Returns current distance between Nodes in x plane
    getDistanceX()
    {
        let distBetweenNodesX = this.nodeA.position.x - this.nodeB.position.x
        return distBetweenNodesX
    }

    // Returns current distance between Nodes in y plane
    getDistanceY()
    {
        let distBetweenNodesY = this.nodeA.position.y - this.nodeB.position.y
        return distBetweenNodesY
    }
}