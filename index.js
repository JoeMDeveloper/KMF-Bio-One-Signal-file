const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OneSignal = require('onesignal-node');

const oneSignalClient = new OneSignal.Client({
    app: { appAuthKey: 'ZmQ0YTRiNjctYWRlMy00MDdiLThmNTctMjA5ODE0NDExZWNj' },
});

exports.sendNotificationOnNewQuestion = functions.database
    .ref('/questions/{questionId}')
    .onCreate(async (snapshot, context) => {
        const questionData = snapshot.val();
        const questionText = questionData.questionText;

        // Get the list of all player IDs (user IDs) from your Firebase database
        const playerIds = [];
        const playerIdsSnapshot = await admin.database().ref('/playerIds').once('value');
        playerIdsSnapshot.forEach((childSnapshot) => {
            playerIds.push(childSnapshot.val());
        });

        // Define the notification content
        const notification = new OneSignal.Notification({
            contents: { en: `A new question has been added: "${questionText}"` },
            included_segments: ['Subscribed Users'], // or playerIds if you're using user IDs
        });

        try {
            // Send the notification
            const response = await oneSignalClient.createNotification(notification);

            console.log('Notification sent successfully:', response.body);
            return null;
        } catch (error) {
            console.error('Error sending notification:', error);
            return null;
        }
    });

