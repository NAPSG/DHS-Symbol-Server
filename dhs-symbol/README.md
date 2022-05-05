# dhs-symbol Notes

- Could not import anything from svgdom for unknown reason, using require with lint disable for that specific line
- Could not import registerWindow from svgdotjs for unknown reason, using require with lint disable for that specific line
- Mixing alpha with numeric when naming assets causes a dash to be inserted between the switch 
- Had to edit node_modules/svgdom/main-require.cjs to remove Date references in order to run in Android