/**
 * Inventors blocks
 */

//% weight=100 color=#df6721 icon="\uf185" block="Inventors"
//% groups="['Servo', 'RGB']"
namespace Inventors {
    export enum MotorDirection {
        //% block="CW"
        CW = 0x00,
        //% block="CCW"
        CCW = 0x01
    }

    export enum CustomAllPin {
        //% block="P0"
        P0,
        //% block="P1"
        P1,
        //% block="P2"
        P2,
    }

    export enum CustomAnalogPin {
        //% block="P0"
        P0,
        //% block="P1"
        P1,
        //% block="P2"
        P2
    }

    let minAngle: number = 0;
    let maxAngle: number = 180;
    let stopOnNeutral: boolean = false;

    let address = 0x10; // I2C address of the sensor
    let rgbBright = 255;
    let rgbPin = -1;
    let neopixelBuf: Buffer;
    let ledsum = -1;

    /**
     * Set the angle of a 180° servo motor, range: 0~180°.
     * @param pin ..., eg: inventors.CustomAllPin.P0
     * @param degree ..., eg: 90
     */
    //% block="set pin %pin 180 servo to %degree=protractorPicker degree"
    //% group="Servo"
    //% weight=90
    export function servoRun180(pin: CustomAllPin, degree: number): void {
        degree = degree | 0;
        degree = Math.clamp(minAngle, maxAngle, degree);
        let _pin = toPwmOnlyPin(pin);
        pins.servoSetContinuous(_pin, false);
        pins.servoWritePin(_pin, degree);
    }

    /**
     * Set the forward and reverse speed of a 360° servo motor, range: 0~100.
     * @param pin ..., eg: inventors.CustomAllPin.P0
     * @param speed ..., eg: 50
     * @param dir ..., eg: inventors.MotorDirection.CW
     */
    //% block="set pin $pin 360 servo rotate $dir at $speed \\% speed"
    //% group="Servo"
    //% speed.min=0 speed.max=100
    //% weight=85
    export function servoRun360(pin: CustomAllPin, speed: number, dir: MotorDirection): void {
        const degrees = Math.clamp(minAngle, maxAngle, Math.map(dir === MotorDirection.CCW ? -speed : speed, -100, 100, minAngle, maxAngle));
        const neutral = (maxAngle - minAngle) >> 1;
        let _pin = toPwmOnlyPin(pin);
        pins.servoSetContinuous(_pin, true);
        pins.servoWritePin(_pin, degrees);
    }

    /**
     * Set the total number of RGB lights.
     * @param pin ..., eg: robotics.CustomAllPin.P0
     * @param num ..., eg: 5
     */
    //% block="pin $pin $num RGB LEDs"
    //% group="RGB"
    //% num.min=1 num.max=5
    //% weight=55
    export function ws2812Init(pin: CustomAllPin, num: number): void {
        rgbPin = toDigitalPin(pin);
        neopixelBuf = pins.createBuffer(3 * num);
        for (let i = 0; i < 3 * num; i++) {
            neopixelBuf[i] = 0;
        }
        ledsum = num;
    }

    /**
     * Set the brightness of RGB LEDs lights.
     * @param brightness ..., eg: 200
     */
    //% block="RGB LEDs brightness %brightness"
    //% group="RGB"
    //% brightness.min=0 brightness.max=255
    //% weight=50
    export function ws2812SBrightness(brightness: number): void {
        rgbBright = brightness;
    }

    /**
     * Set the starting and ending light numbers for the RGB LEDs lights.
     * @param from ..., eg: 1
     * @param to ..., eg: 2
     */

    //% block="RGB LEDs from %from to %to"
    //% group="RGB"
    //% from.min=1 from.max=5
    //% to.min=1 to.max=5
    //% weight=48
    export function ws2812LedRange(from: number, to: number): number {
        return ((from - 1) << 16) + (2 << 8) + (to);
    }

    /**
     * Set the display color for a specific light number.
     * @param index ..., eg: 1
     * @param color ..., eg: 0xFF0000
     */
    //% block="RGB LEDs %index show color %color"
    //% group="RGB"
    //% index.min=1 index.max=5
    //% color.shadow="colorNumberPicker"
    //% weight=45
    export function ws2812SetIndexColor(index: number, color: number): void {
        let f = index - 1;
        let t = index - 1;
        let r = (color >> 16) * (rgbBright / 255);
        let g = ((color >> 8) & 0xFF) * (rgbBright / 255);
        let b = ((color) & 0xFF) * (rgbBright / 255);

        if ((index - 1) > 15) {
            if ((((index - 1) >> 8) & 0xFF) == 0x02) {
                f = (index - 1) >> 16;
                t = (index - 1) & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixelBuf[i * 3 + 0] = Math.round(g)
            neopixelBuf[i * 3 + 1] = Math.round(r)
            neopixelBuf[i * 3 + 2] = Math.round(b)
        }
        light.sendWS2812Buffer(neopixelBuf, rgbPin);
    }

    /**
     * Set the display color for all light numbers.
     * @param color ..., eg: 0xFF0000
     */

    //% block="show color %color"
    //% group="RGB"
    //% weight=43
    //% color.shadow="colorNumberPicker"
    export function ws2812ShowColor(color: number): void {
        let r = (color >> 16) * (rgbBright / 255);
        let g = ((color >> 8) & 0xFF) * (rgbBright / 255);
        let b = ((color) & 0xFF) * (rgbBright / 255);
        for (let i = 0; i < 3 * ledsum; i++) {
            if ((i % 3) == 0)
                neopixelBuf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixelBuf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixelBuf[i] = Math.round(b)
        }
        light.sendWS2812Buffer(neopixelBuf, rgbPin)
    }

    /**
     * Turn off all RGB LEDs lights.
     */
    //% block="clear all RGB LEDs"
    //% group="RGB"
    //% weight=40
    export function ws2812Off(): void {
        ws2812ShowColor(0);
    }

    /**
     * Move or transform the color or state on the light strip by x units.
     * @param offset ..., eg: 0
     */
    //% block="shift pixels by %offset"
    //% group="RGB"
    //% weight=38
    export function ws2812Shift(offset: number): void {
        let steps = ledsum
        if (offset > steps) {
            for (let i = 0; i < 16 * steps; i++) {
                neopixelBuf[i] = 0;
            }
        }
        if (ledsum > 1 && offset != 0) {
            if (offset > 0) {
                for (let i = steps - 1; i >= offset; i--) {
                    neopixelBuf[i * 3] = neopixelBuf[(i - offset) * 3]
                    neopixelBuf[i * 3 + 1] = neopixelBuf[(i - offset) * 3 + 1]
                    neopixelBuf[i * 3 + 2] = neopixelBuf[(i - offset) * 3 + 2]
                }
                for (let i = 0; i < offset; i++) {
                    neopixelBuf[i * 3] = 0
                    neopixelBuf[i * 3 + 1] = 0
                    neopixelBuf[i * 3 + 2] = 0
                }
            }
            else {
                for (let i = 0; i <= steps - Math.abs(offset); i++) {
                    neopixelBuf[i * 3] = neopixelBuf[(i + Math.abs(offset)) * 3]
                    neopixelBuf[i * 3 + 1] = neopixelBuf[(i + Math.abs(offset)) * 3 + 1]
                    neopixelBuf[i * 3 + 2] = neopixelBuf[(i + Math.abs(offset)) * 3 + 2]
                }
                for (let i = steps - Math.abs(offset); i < steps; i++) {
                    neopixelBuf[i * 3] = 0
                    neopixelBuf[i * 3 + 1] = 0
                    neopixelBuf[i * 3 + 2] = 0
                }
            }
            light.sendWS2812Buffer(neopixelBuf, rgbPin)
        }
    }

    /**
     * Cycle the color or state on the light strip by x units.
     * @param offset ..., eg: 0
     */
    //% block="rotate pixels by %offset"
    //% group="RGB"
    //% weight=35
    export function ws2812Rotate(offset: number): void {
        let steps = ledsum
        if (offset > 0) {
            offset = offset % steps;
        } else {
            offset = Math.abs(offset) % steps;
            offset = -offset;
        }
        if (ledsum > 1 && offset != 0) {
            if (offset > 0) {
                let offdata = pins.createBuffer(3 * offset);
                for (let i = 0; i < offset; i++) {
                    offdata[i * 3] = neopixelBuf[(steps - offset + i) * 3]
                    offdata[i * 3 + 1] = neopixelBuf[(steps - offset + i) * 3 + 1]
                    offdata[i * 3 + 2] = neopixelBuf[(steps - offset + i) * 3 + 2]
                }
                for (let i = steps - 1; i >= offset; i--) {
                    neopixelBuf[i * 3] = neopixelBuf[(i - offset) * 3]
                    neopixelBuf[i * 3 + 1] = neopixelBuf[(i - offset) * 3 + 1]
                    neopixelBuf[i * 3 + 2] = neopixelBuf[(i - offset) * 3 + 2]
                }
                for (let i = 0; i < offset; i++) {
                    neopixelBuf[i * 3] = offdata[i * 3]
                    neopixelBuf[i * 3 + 1] = offdata[i * 3 + 1]
                    neopixelBuf[i * 3 + 2] = offdata[i * 3 + 2]
                }
                light.sendWS2812Buffer(neopixelBuf, rgbPin)
            }
            else {
                let offdata = pins.createBuffer(3 * Math.abs(offset));
                for (let i = 0; i < Math.abs(offset); i++) {
                    offdata[i * 3] = neopixelBuf[i * 3]
                    offdata[i * 3 + 1] = neopixelBuf[i * 3 + 1]
                    offdata[i * 3 + 2] = neopixelBuf[i * 3 + 2]
                }
                for (let i = 0; i <= steps - Math.abs(offset); i++) {

                    neopixelBuf[i * 3] = neopixelBuf[(i + Math.abs(offset)) * 3]
                    neopixelBuf[i * 3 + 1] = neopixelBuf[(i + Math.abs(offset)) * 3 + 1]
                    neopixelBuf[i * 3 + 2] = neopixelBuf[(i + Math.abs(offset)) * 3 + 2]
                }
                for (let i = steps - Math.abs(offset); i < steps; i++) {
                    neopixelBuf[i * 3] = offdata[(i - steps + Math.abs(offset)) * 3]
                    neopixelBuf[i * 3 + 1] = offdata[(i - steps + Math.abs(offset)) * 3 + 1]
                    neopixelBuf[i * 3 + 2] = offdata[(i - steps + Math.abs(offset)) * 3 + 2]
                }
                light.sendWS2812Buffer(neopixelBuf, rgbPin)
            }
        }
    }

    /**
     * Set RGB LEDs lights to display gradient colors; range: 1~360.
     * @param start ..., eg: 1
     * @param end ..., eg: 5
     * @param startHue ..., eg: 1
     * @param endHue ..., eg: 360
     */
    //% block="RGB LEDs %start to %end show gradient color from %startHue to %endHue"
    //% group="RGB"
    //% start.min=1 start.max=5 
    //% end.min=1 end.max=5
    //% startHue.min=0 startHue.max=360
    //% endHue.min=0 endHue.max=360
    //% weight=30
    //% inlineInputMode=inline
    export function ws2812Rainbow(start: number, end: number, startHue: number, endHue: number): void {
        start = start - 1
        end = end - 1
        if ((end < start)) {
            let num = end;
            end = start;
            start = num;
        }

        start = Math.max(start, 0);
        start = Math.min(start, ledsum);
        end = Math.max(end, 0);
        end = Math.min(end, ledsum);
        let steps = end - start + 1;
        const saturation = 100;
        const luminance = 50;

        //hue
        const h1 = startHue;
        const h2 = endHue;
        const hDistCW = ((h2 + 360) - h1) % 360;
        const hStepCW = Math.idiv((hDistCW * 100), steps);
        let hStep: number = hStepCW;
        const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

        //sat
        const s1 = saturation;
        const s2 = saturation;
        const sDist = s2 - s1;
        const sStep = Math.idiv(sDist, steps);
        const s1_100 = s1 * 100;

        //lum
        const l1 = luminance;
        const l2 = luminance;
        const lDist = l2 - l1;
        const lStep = Math.idiv(lDist, steps);
        const l1_100 = l1 * 100

        //interpolate
        if (steps === 1) {
            writeBuff(start, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
        } else {
            writeBuff(start, hsl(startHue, saturation, luminance));
            for (let i = start + 1; i < start + steps - 1; i++) {
                const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                const s = Math.idiv((s1_100 + i * sStep), 100);
                const l = Math.idiv((l1_100 + i * lStep), 100);
                writeBuff(0 + i, hsl(h, s, l));
            }
            writeBuff(start + steps - 1, hsl(endHue, saturation, luminance));
        }
        light.sendWS2812Buffer(neopixelBuf, rgbPin)
    }

    /**
     * Set RGB LEDs light colors using primary colors (red, green, blue).
     * @param red ..., eg: 255
     * @param green ..., eg: 255
     * @param blue ..., eg: 255
     */
    //% block="red %red green %green blue %blue"
    //% group="RGB"
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% weight=25
    export function getWs2812Color(red: number, green: number, blue: number): number {
        return (red << 16) + (green << 8) + (blue);
    }

    function writeBuff(index: number, rgb: number) {
        if (index < ledsum) {
            let r = ((rgb >> 16) * (rgbBright / 255));
            let g = (((rgb >> 8) & 0xFF) * (rgbBright / 255));
            let b = (((rgb) & 0xFF) * (rgbBright / 255));
            neopixelBuf[index * 3 + 0] = Math.round(g)
            neopixelBuf[index * 3 + 1] = Math.round(r)
            neopixelBuf[index * 3 + 2] = Math.round(b)
        }
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
    }

    function toAnalogPin(pin: CustomAnalogPin): AnalogPin {
        switch (pin) {
            case CustomAnalogPin.P0: return AnalogPin.P0;
            case CustomAnalogPin.P1: return AnalogPin.P1;
            case CustomAnalogPin.P2: return AnalogPin.P2;
            default: return AnalogPin.P0;
        }
    }

    function toDigitalPin(pin: CustomAllPin): DigitalPin {
        switch (pin) {
            case CustomAllPin.P0: return DigitalPin.P0;
            case CustomAllPin.P1: return DigitalPin.P1;
            case CustomAllPin.P2: return DigitalPin.P2;
            default: return DigitalPin.P0;
        }
    }

    function toPwmOnlyPin(pin: CustomAllPin): AnalogPin {
        switch (pin) {
            case CustomAllPin.P0: return AnalogPin.P0;
            case CustomAllPin.P1: return AnalogPin.P1;
            case CustomAllPin.P2: return AnalogPin.P2;
            default: return AnalogPin.P0;
        }
    }
}
