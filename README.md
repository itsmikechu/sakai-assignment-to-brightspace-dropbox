# sakai-assignment-to-brightspace-dropbox
Migrates assignments from Sakai to dropboxes in Brightspace

You'll need a config.json near your app entry point (/build dir) that looks like 

```
{ 
    "brightspace": {
        "userId": "<BRIGHTSPACE USER NAME>",
        "userKey": "<BRIGHTSPACE PASSWORD>",
        "appId": "<APP ID FROM MANAGE EXTENSIBILITY TOOL>",
        "appKey": "<APP KEY FROM MANAGE EXTENSIBILITY TOOL>"
    },
    "sakai" : {
        "userId": "<SAKAI USER EID>",
        "password": "<SAKAI USER PASSWORD>"
    }
} 
```
--- 
A quick utility for Ashworth College
