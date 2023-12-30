import { HID } from 'https://cdn.jsdelivr.net/npm/webchuck/+esm';

async function initHID() {
    // wait until theChuck is defined
    while (window.theChuck === undefined)  {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    window.hid = await HID.init(theChuck);
}

initHID();

