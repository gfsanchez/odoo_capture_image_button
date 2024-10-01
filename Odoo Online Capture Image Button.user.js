// ==UserScript==
// @name         Odoo Online Capture Image Button
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Adds a 'Capture Image' button in the comment menu bar in Odoo Online to capture and upload webcam pictures as attachments without submitting them immediately.
// @updateURL    https://raw.githubusercontent.com/gfsanchez/odoo_capture_image_button_new/main/Odoo%20Online%20Capture%20Image%20Button.user.js
// @downloadURL  https://raw.githubusercontent.com/gfsanchez/odoo_capture_image_button_new/main/Odoo%20Online%20Capture%20Image%20Button.user.js
// @match        https://*.odoo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to add the 'Capture Image' button in the specified location
    function addUploadButton() {
        console.log('Attempting to add the capture button...');

        // Check if the button already exists to avoid duplicates
        if (document.querySelector('#capture-image-button')) {
            console.log('Capture Image button already exists.');
            return;
        }

        // Find the menu bar container div using the provided class
        let menuBar = document.querySelector('.d-flex.flex-grow-1.align-items-center');
        if (!menuBar) {
            console.error('Menu bar not found.');
            return;
        }

        console.log('Menu bar found. Adding the capture button.');

        // Create the 'Capture Image' button
        let captureButton = document.createElement('button');
        captureButton.id = 'capture-image-button';
        captureButton.innerText = 'Capture Image';
        captureButton.classList.add('btn', 'border-0', 'rounded-pill');
        captureButton.style.margin = '0 10px';
        captureButton.style.padding = '8px 16px';
        captureButton.style.backgroundColor = '#007bff';
        captureButton.style.color = '#fff';
        captureButton.style.border = 'none';
        captureButton.style.cursor = 'pointer';

        // Insert the button after the "Attach files" button
        let attachButton = menuBar.querySelector('.o-mail-Composer-attachFiles');
        if (attachButton) {
            attachButton.parentNode.insertBefore(captureButton, attachButton.nextSibling);
            console.log('Capture Image button added successfully.');
        } else {
            console.warn('Attach files button not found. Appending capture button at the end.');
            menuBar.appendChild(captureButton);
        }

        // Add click event to the button to capture and upload image
        captureButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the event from bubbling up to parent elements
            event.preventDefault(); // Prevent default action
            captureImage();
        });
    }

    // Function to capture image from the webcam
    function captureImage() {
        console.log('Capture image function called.');
        try {
            // Create a modal to show the video and capture button
            let modal = document.createElement('div');
            modal.id = 'webcam-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '9999';

            let modalContent = document.createElement('div');
            modalContent.style.backgroundColor = '#fff';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '8px';
            modalContent.style.textAlign = 'center';
            modalContent.style.position = 'relative';

            // Create close button for the modal
            let closeButton = document.createElement('button');
            closeButton.innerHTML = '&times;';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.backgroundColor = 'transparent';
            closeButton.style.color = '#000';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '50%';
            closeButton.style.width = '30px';
            closeButton.style.height = '30px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '20px';
            closeButton.style.lineHeight = '22px';
            closeButton.style.transition = 'background-color 0.3s';
            closeButton.onmouseover = function() {
                closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            };
            closeButton.onmouseout = function() {
                closeButton.style.backgroundColor = 'transparent';
            };
            closeButton.onclick = function() {
                closeModal(modal, video);
            };
            modalContent.appendChild(closeButton);

            // Create video element for webcam
            let video = document.createElement('video');
            video.id = 'webcam-video';
            video.style.width = '320px';
            video.style.height = '240px';
            modalContent.appendChild(video);

            // Create capture button
            let captureBtn = document.createElement('button');
            captureBtn.innerText = 'Capture';
            captureBtn.style.marginTop = '10px';
            captureBtn.style.padding = '12px 0'; // Increase top and bottom padding
            captureBtn.style.width = '100%'; // Make the button as broad as the preview window
            captureBtn.style.backgroundColor = '#007bff';
            captureBtn.style.color = '#fff';
            captureBtn.style.border = 'none';
            captureBtn.style.cursor = 'pointer';
            captureBtn.style.borderRadius = '0'; // Remove border radius for a flat button look
            captureBtn.onclick = function() {
                takeSnapshot(video);
            };
            modalContent.appendChild(captureBtn);

            // Append modal content to modal
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Access the webcam
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                video.srcObject = stream;
                video.play();
                console.log('Webcam stream started.');
            }).catch(function(err) {
                console.error('Error accessing webcam: ', err);
            });
        } catch (error) {
            console.error('Error capturing image:', error);
        }
    }

    // Function to close the modal and stop the webcam
    function closeModal(modal, video) {
        console.log('Closing webcam modal.');
        // Stop the webcam
        let stream = video.srcObject;
        if (stream) {
            let tracks = stream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });
        }
        // Remove the modal from the DOM
        if (modal) {
            document.body.removeChild(modal);
        }
    }

    // Function to take snapshot, convert it to a File object, and upload it as an attachment
    function takeSnapshot(video) {
        console.log('Taking snapshot from video.');
        try {
            let canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 240;
            let context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Stop the webcam
            let stream = video.srcObject;
            let tracks = stream.getTracks();
            tracks.forEach(function(track) {
                track.stop();
            });

            // Remove the modal
            let modal = document.getElementById('webcam-modal');
            if (modal) {
                document.body.removeChild(modal);
            }

            // Convert canvas to data URL (base64)
            canvas.toBlob(function(blob) {
                let file = new File([blob], "captured-image.png", { type: "image/png" });
                console.log('Captured image file:', file); // Debugging statement to log the file object
                uploadAttachment(file);
            }, 'image/png');
        } catch (error) {
            console.error('Error taking snapshot:', error);
        }
    }

    // Function to upload the captured image as an attachment
    function uploadAttachment(file) {
        console.log('Uploading captured image as an attachment.');
        try {
            // Find the file input element in the attachment area
            let fileInput = document.querySelector('.o_input_file');

            if (fileInput) {
                // Create a new DataTransfer object and append the captured file
                let dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);

                // Set the files property of the input element to the DataTransfer object
                fileInput.files = dataTransfer.files;

                // Trigger the change event on the input element to upload the file
                let event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);

                console.log('Captured image uploaded as an attachment.');
            } else {
                console.error('File input element not found.');
                alert('Unable to find the file input element for attachments.');
            }
        } catch (error) {
            console.error('Error uploading attachment:', error);
        }
    }

    // Enhanced observer function to check for changes
    function observeDOMChanges() {
        const observer = new MutationObserver(() => {
            console.log('DOM change detected, checking and re-adding the button if needed...');
            addUploadButton();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Start the initial button addition and observer
    function initScript() {
        console.log('Initializing the script...');
        addUploadButton(); // Initial button addition
        observeDOMChanges(); // Start observing DOM changes
    }

    // Ensure the script runs only after the page is fully loaded
    window.addEventListener('load', initScript);
})();
