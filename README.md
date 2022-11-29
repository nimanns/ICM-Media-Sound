# ICM Media: Sound

With this project I wanted to imitate digital audio plugins and how they function, they usually have a flashy graphical interface paired with some code that takes care of the audio data in real time. To achieve better results, actual audio plugins use two different threads to process graphics and audio data individually, in the realm of JavaScript, we're stuck with one. The audio quality is not perfect, I'm using one single oscillator for each string with a sawtooth waveshape, so not much can be expected sound-wise. But the fact that I was able to put together the general idea using p5 and javascript is exciting to me. I enjoy recreating real-life objects in software. I tried to adhere to OOP principles as much as possible but there are some hacky stuff done inside the code, I may need to refactor some parts to remain consistent but overall I'm happy with the result. I have a string class that contains each string with its corresponding oscillator and visuals, I needed to have them inside separate classes so that I could easily vibrate the string once a note is played on that string. I've used real life guitar and pedal images and have used photoshop to remove the background and lay them on top of eachother. One thing that I found frustrating was dealing with audio context not being created until a user action was detected on the browser window, it made the whole thing unfunctional on refreshes, so I had to add a button to start the process so that the user would click and by clicking, would allow the audio context be created;
