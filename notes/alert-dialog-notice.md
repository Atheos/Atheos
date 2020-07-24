Source: https://ux.stackexchange.com/questions/90336/whats-the-difference-between-a-modal-popup-popover-and-lightbox

All of these UI components are containers/windows that show on top of the content you are currently viewing/interacting with. The different names are based on the attention they deserve, the context you're in, and how you can interact with them.

**Alert** - These messages need immediate attention. The window/container is usually locked, meaning you can't dismiss the box or continue with what you want to do until you explicitly acknowledge the content, this usually done by clicking a button inside the container. The buttons on this window are usually "OK" or "Cancel". (If you're showing a lot of these it's usually a failure of design because your user's expectations don't match the UI expectations.)

[![enter image description here](https://i.stack.imgur.com/VLXYg.png)](https://i.stack.imgur.com/VLXYg.png)

**Modal/Dialog** - These are for getting work done. (Example: a button that says "Invite Friends" will open such a container with a list friends you can then invite). These let you do more work without having to show all the information on the main screen. These messages are not locked and you can click anywhere to dismiss the container.\
[![enter image description here](https://i.stack.imgur.com/ZQdFs.jpg)](https://i.stack.imgur.com/ZQdFs.jpg)

**Popup** - You don't need to deal with these messages right away, yet at some point you will need to take action since these won't go away until explicitly say say you don't want them around anymore.\
[![enter image description here](https://i.stack.imgur.com/kQWPC.png)](https://i.stack.imgur.com/kQWPC.png)

**Flash Notice/Growl Notification** - These notifications have a time associated with them. You can choose to deal with them right away, or if you don't do anything, after a certain time they will dismiss themselves.\
[![enter image description here](https://i.stack.imgur.com/TbePO.png)](https://i.stack.imgur.com/TbePO.png)

**Lightbox/Theatres** - These are used to enlarge and bring one part of screen to focus. These containers are most commonly used to view images. Usually you are then able to navigate through similar content (the next photo in the gallery) without dismissing and clicking on another thumbnail. These can be locked or not. Depends on if you want people to return the context they were in or to continue on a new context thread.\
[![enter image description here](https://i.stack.imgur.com/yw2CZ.jpg)](https://i.stack.imgur.com/yw2CZ.jpg)

**Popover/Tooltip/Hovercard** - These are passive approaches to showing more information. These are used to add simple instructions or explanations or foreshadow what will happen if you click a link.\
[![enter image description here](https://i.stack.imgur.com/ha3RB.jpg)](https://i.stack.imgur.com/ha3RB.jpg) [![enter image description here](https://i.stack.imgur.com/sgYYj.jpg)](https://i.stack.imgur.com/sgYYj.jpg)