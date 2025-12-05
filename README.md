# Creative Inventors Kit for micro:bit

The Creative Inventors Kit for micro:bit is a blocks platform based on the micro:bit controller.  The accompanying top plate is directly compatible with 9g servos  and the expansion board, allowing for quick installation of various sensors.

The platform's IO expansion board provides analog 3-pin interfaces, enabling easy expansion and control of a wide range of devices. The expansion board features a built-in dual motor driver, eliminating the need to use additional pins. Furthermore, the expansion board exposes the micro:bit edge connector pins (0, 1, 2, 3V, GND), offering developers more interface options.




## Basic usage
1. Initialize the 180° servo motor to 0 degrees, then rotate it to the 90-degree position.

    ```blocks
    Inventors.servoRun180(Inventors.CustomAllPin.P0, 0)
    basic.forever(function () {
        Inventors.servoRun180(Inventors.CustomAllPin.P0, 90)
    })
    ```
2. Control the speed of a 360° servo motor: First, make the servo connected to port P0 rotate forward at 50% speed for 1 second, then reverse for 1 second.

    ```blocks
    basic.forever(function () {
        Inventors.servoRun360(Inventors.CustomAllPin.P0, 50, Inventors.MotorDirection.CW)
        basic.pause(1000)
        Inventors.servoRun360(Inventors.CustomAllPin.P0, 50, Inventors.MotorDirection.CCW)
        basic.pause(1000)
    })
    ```
3. Initialize the RGB LED strip and set the brightness to 200. Then, make the strip display green, which will last for 5 seconds before turning off the LED strip.
   
    ```blocks
    Inventors.ws2812Init(Inventors.CustomAllPin.P0, 5)
    Inventors.ws2812SBrightness(200)
    Inventors.ws2812ShowColor(0x00ff00)
    basic.pause(5000)
    Inventors.ws2812Off()
    ```
4. Initialize the RGB LED strip, making the 1st and 2nd LEDs display red, the 3rd, 4th and 5th LEDs display green.
   
    ```blocks
    robotics.ws2812Init(robotics.CustomAllPin.P0, 5)
    robotics.ws2812SBrightness(200)
    basic.forever(function () {
        Inventors.ws2812SetIndexColor(Inventors.ws2812LedRange(1, 2), 0xFF0000)
        Inventors.ws2812SetIndexColor(Inventors.ws2812LedRange(3, 5), 0x00ff00)
    })
    ```
5. Initialize the RGB LED strip to display a gradient color effect.

    ```blocks
    Inventors.ws2812Init(robotics.CustomAllPin.P0, 5)
    Inventors.ws2812SBrightness(200)
    basic.forever(function () {
        Inventors.ws2812Rainbow(1, 5, 1, 360)
    })
    ```
6. Use the micro:bit A button to control the lighting of the RGB LED strip. Each time button A is pressed, move the LEDs of the strip one position to the right, checking the button status every 100 milliseconds.

    ```blocks
    Inventors.ws2812Init(Inventors.CustomAllPin.P0, 5)
    Inventors.ws2812SBrightness(200)
    while (true) {
        if (input.buttonIsPressed(Button.A)) {
            Inventors.ws2812Shift(1)
            Inventors.ws2812SetIndexColor(1, 0xFF0000)
        }
        basic.pause(100)
    }
   
   ```
   
## LIcense

MIT

Copyright (c) 2020, microbit/micropython Chinese community  

## Supported targets

* for PXT/microbit

```package
Inventors=github:Keyestudio/pxt-creative-inventors-kit
```

