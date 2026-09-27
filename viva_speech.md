# AgriHerd - Final Viva Presentation Speech

**Estimated Time: 5 Minutes**

---

### 1. Introduction (Approx. 1 minute)
"Good morning everyone. My name is [Your Name], and today I am excited to present my final project, called **AgriHerd**. 

AgriHerd is a modern web application designed for farmers to manage their livestock and dairy farm. The biggest problem farmers face with technology is bad internet connection out in the fields. To solve this, I built AgriHerd as an **offline-first** application. This means the app works perfectly, fast, and without errors, even if there is zero internet."

### 2. Main Features (Approx. 1.5 minutes)
"Let me explain what the app does. 
First, farmers can use the app to register new animals by entering their tag ID, breed, and birth date. 
Second, farm workers can log daily health and production records. They can track body temperature, how much feed the animal ate, and how much milk it produced.

Because the app is offline-first, when a farmer clicks 'save', the data is immediately stored directly on their device using a local database called Dexie.js. The dashboard updates instantly. This makes the app incredibly fast because it doesn't have to wait for a slow internet connection."

### 3. How the Cloud Sync Works (Approx. 1.5 minutes)
"So, how does the data get to the main system? 
I built a smart **Background Sync Engine**. The app constantly checks if the internet is back. As soon as the device goes online, the app takes all the saved data and quietly sends it to our secure cloud database, which is built with Supabase. 

If there is a problem while saving to the cloud—for example, if the cloud database has a slightly different setup than the app—I created a special **Self-Healing System**. The app will automatically find the error, fix the data mismatch, and try saving again until it succeeds. This ensures the app never crashes and the farmer never loses their hard work."

### 4. Technical Stack (Approx. 45 seconds)
"To build this, I used modern web technologies. 
The user interface is built with **Next.js** and **Tailwind CSS**, making it look very clean and easy to use on both mobile phones and computers. 
For the local offline database, I used **Dexie.js**, and for the cloud backend, I used **Supabase**."

### 5. Conclusion (Approx. 15 seconds)
"In conclusion, AgriHerd brings modern technology to agriculture by solving the real-world problem of bad internet connectivity. It helps farmers track their animals' health and production reliably and easily. 

Thank you for listening. I would be happy to answer any questions you have."
