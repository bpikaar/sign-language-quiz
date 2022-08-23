# Sign language quiz

With this machine learning application you can teach other people sign language.

The application consists of 2 parts.

## Learn

https://bpikaar.github.io/sign-language-quiz/learn/ 

### Step 1
Select the camera you want to use. 

### Step 2 Label a sign 
To do this
- type in the name of the sign in de input field called "label" (for example "A")
- show your hand in front of the camera. Hold steady and press STORE.
- repeat this process a couple of times for the same sign. Tilt your hand but keep in mind that your hands keeps making the same sign. 

You can repeat this for other signs. 

### Step 3 Store the data in the browser

When all signs are made, store this information in de storage of the browser by pressing "ADD TO INDEXEDDB".

### Step 4 Making the machine learning model. 

The data stored in de brower is fed to a machine learning algorithm to train a model. You can activate this by pressing TRAIN.

### Step 5 Test the model

Now that the model is created the data is no longer needed. The data can be used to add new signs to it. 
To test the created model, just make a sign with you hand and press CLASSIFY. In de console of the browser the output of the model is shown. 

## Quiz

https://bpikaar.github.io/sign-language-quiz

The quiz will show random letter. You make the matching sign with your hand in front of the camera. The machine learning algorithm will check through classification if the sign is correct (or not). 
