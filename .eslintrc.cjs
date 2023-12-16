const { configure, presets } = require("eslint-kit")

module.exports = configure({
    allowDebug: process.env.NODE_ENV !== "production",

    root: {
        rules: {
            "@typescript-eslint/ban-types": "off",
        },
    },
    presets: [
        presets.imports(),
        presets.node(),
        presets.prettier(),
        presets.typescript(),
    ],
})
