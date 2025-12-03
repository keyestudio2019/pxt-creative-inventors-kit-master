// When this software package is used as a plugin, this package will not be compiled.

input.onButtonPressed(Button.A, function () {
    testMode += 1
    if (testMode > 4) {
        testMode = 1
    }
})

function testRgbLight() {
    robotics.ws2812Init(robotics.CustomAllPin.P0, 5)
    robotics.ws2812SBrightness(50)
    robotics.ws2812SetIndexColor(1, 0x007fff)
    robotics.ws2812SetIndexColor(robotics.ws2812LedRange(1, 5), 0xff0000)
    basic.pause(1000)
    robotics.ws2812Off()
    robotics.ws2812Rainbow(1, 5, 1, 360)
    for (let index = 0; index < 5; index++) {
        basic.pause(1000)
        robotics.ws2812Shift(1)
    }
    robotics.ws2812Rainbow(1, 5, 1, 360)
    for (let index = 0; index < 5; index++) {
        basic.pause(1000)
        robotics.ws2812Rotate(1)
    }
}
function testServo() {
    robotics.servoRun180(robotics.CustomAllPin.P1, 0)
    basic.pause(1000)
    robotics.servoRun180(robotics.CustomAllPin.P1, 90)
    basic.pause(1000)
    robotics.servoRun180(robotics.CustomAllPin.P1, 180)
    basic.pause(1000)
    robotics.servoRun360(robotics.CustomAllPin.P2, 50, robotics.MotorDirection.CW)
    basic.pause(1000)
    robotics.servoRun360(robotics.CustomAllPin.P2, 50, robotics.MotorDirection.CCW)
    basic.pause(1000)
    robotics.servoRun360(robotics.CustomAllPin.P2, 0, robotics.MotorDirection.CCW)
}
let testMode = 0
testMode = 0
basic.forever(function () {
    serial.writeString("mode:" + testMode)
    if (testMode == 1) {
        serial.writeLine(" Servo PIN: 180-->P1 360-->P2")
        testServo()
        basic.pause(1000)
    } else if (testMode == 2) {
        serial.writeLine(" RGB PIN: P0")
        testRgbLight()
        basic.pause(1000)
    } else {
        serial.writeLine("")
        serial.writeLine("Press the A key to select the mode")
        basic.pause(1000)
    }
})
