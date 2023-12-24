# snow.js
Small library that makes snow. Usage was intended to add snow to a Jellyfin site, but may apply to other sites (with minor or none changes).

# How To
First, we add the files to the HTML
- Import CSS File
- Import Main JS as a Module

Then we add a div with "snowContainer" ID
That's all!!

# Options
If we want to modify the snow density, or add multiple or different snowflakes, we need to modify main.ts (or .js).

For density, we need to modify the class instance and change the default (30) to a desired density.
```typescript
snow = new Snow(30, false);
```
If we would like to add other snowflakes, we need to modify the "snow.setup" line to add or modify the new SVG snowflakes. Although the library is made to work with images, that functionality has not been tested, so may not work as intended or at all.
```typescript
snow.setup(["assets/snow/svg/snowflake1.svg"]);
```

Feel free to make your changes. Remember, main.ts is made to work with a Jellyfin instance, so sure will differ from your needs.
