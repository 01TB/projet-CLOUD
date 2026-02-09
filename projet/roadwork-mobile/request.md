1. Configuration initiale

    Firebase Console : Création d'un projet Firebase et d'une application web pour obtenir les clés de configuration (API Key, Project ID, etc.).

    Installation : Installation du SDK Firebase dans le projet Vue.js via npm.

2. Obtention du Token d'accès

Pour envoyer une notification à un utilisateur spécifique, l'application doit obtenir un jeton (token) unique :

    Utilisation de la méthode getToken de Firebase.

    Génération d'une clé VAPID (Public Web ID Key) dans les paramètres de la console Firebase pour autoriser l'envoi.

    Une fois le jeton généré, il doit normalement être sauvegardé sur votre serveur backend pour cibler cet utilisateur plus tard.

3. Gestion du Service Worker

Un fichier indispensable nommé firebase-messaging-sw.js doit être placé dans le dossier public du projet. Ce "Service Worker" permet de :

    Recevoir des messages même si l'application est en arrière-plan ou fermée.

    Utiliser la méthode onBackgroundMessage pour définir le titre, le corps du texte et l'icône de la notification qui apparaîtra sur le système de l'utilisateur.

4. Réception des messages au premier plan

Si l'utilisateur est activement sur l'application (foreground) :

    On utilise la méthode onMessage dans le code principal de Vue.js pour intercepter la notification.

    À ce stade, vous pouvez choisir de mettre à jour l'interface utilisateur (UI) ou d'afficher une alerte personnalisée.

5. Envoi depuis un serveur (Backend)

La vidéo montre enfin comment automatiser l'envoi via un script Node.js :

    Installation de firebase-admin.

    Utilisation d'une clé privée (Service Account) pour authentifier le serveur.

    Configuration de l'objet message avec un titre, un corps et même un lien de redirection (link) qui s'ouvre lorsque l'utilisateur clique sur la notification.

En résumé, l'intégration repose sur un échange entre le client (qui génère un token), Firebase (qui route le message) et éventuellement un serveur (qui déclenche l'envoi).