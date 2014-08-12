Password Length Inspector
=========================

> - Are you using password managing tools, such as [KeePass][1], [1Password][2] or [LastPass][3]?
> - Ever had the problem to find out the maximum allowed length of a password when you were registering for a website and wanted to generate a password with your managing tool?

**Password Length Inspector will help you identifying the input length constraints of ANY password field on any website.**

After installing this extension, you will find a _small indicator next to every password field_, telling you how many characters may be entered into that specific field. In case there is no character limit, infinity will be displayed. This way, you will have never to figure manually (for instance by digging in the source code of the website) how many characters are allowed to be entered in a password field.

As an indicator is displayed right next to the password field, it sometimes can happen that it covers for instance the submit or login button. Fortunately, this extension allows the indicator to be dragged around by the mouse in order to reveal any important controls or other parts of the web pages, being covered by the indicator.

_One Note: in case there is no limit set on a password field, this does not automatically mean that the website will accept passwords with any length. Instead, it can happen that after submitting the form containing the password field, you’ll get a validation error, telling you no more than XYZ characters are allowed. Unfortunately, this information may not be visible or detectable before actually submitting a form._

## Translations ##
**Password Length Inspector** is multi-language / multi-locale enabled but currently lacks translations of the options messages and labels for several languages.
[In order to support with the the translation of any language, please go to `koddistortion.oneskyapp.com`](https://koddistortion.oneskyapp.com/collaboration/project?id=32887) 


Changelog
---------
### v1.3.0 [2014/08/12]
* **New** - Extension Options page now uses i18n for displaying labels and messages in different locales (currently german and english only)
* **New** - Dragging of the indicator can now be enabled and disabled in the options

### v1.2.0 [2014/08/12]
* **New** - Options page added that allows configuration of the extension
* **New** - Indicator can now be positioned left or right of the password field and inside or outside of it (addressing #3)
* **New** - Observation of dynamically added password fields can now enabled or disabled (addressing #6)

### v1.1.0 [2014/08/07]
* **New** - Dynamically added password fields are now attached with indicators
* **Improvement** - Indicators are now attached and bound to password fields properties (visibility & position)
* **Bug Fix** - Indicators ``Z-Index`` is now properly calculated based on password fields ``Z-Index``

### v1.0.0 [2014/08/01]
* **New** - First publicly available version


Libraries used
--------------
* [JQuery v1.10.2][4]
* [JQuery UI v1.11.0 (core.js, widget.js, mouse.js, draggable.js)][5]
* [arrive.js v2.0.0][6]

  [1]: http://keepass.info
  [2]: https://agilebits.com/onepassword
  [3]: https://lastpass.com/
  [4]: http://jquery.org
  [5]: http://jqueryui.com
  [6]: https://github.com/uzairfarooq/arrive

