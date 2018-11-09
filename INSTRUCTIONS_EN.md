## INSTRUCTIONS

### Sandbox

- Join sandbox [Slack](https://join.slack.com/t/impulso-sandbox/shared_invite/enQtNDQwODY3MzcxNDEzLTc1NTlkODA4NmY0YjJkZWYyMWRiOTE2MTA5YzczMzVhNzQzZDY0ZDVkYjI3ZDFlMTQ2ZmFmOTRmODNmMWRhOGY)

### Use ngrok

- Install [ngrok](https://ngrok.com/)
- Unzip download folder
- Run on terminal `./ngrok http 4390`
- Copy forwarding address

<span style="font-style: italic">
Note: ngrok constantly changes this URL
</span>


### Use localtunnel

- Install [localtunnel](https://localtunnel.github.io/www/)
- Installing localtunnel
```sh
  $ npm install -g localtunnel
```
- Using localtunnel
```sh
  $ lt -s atena-{yourname} -p 4390
```
- Example `lt -s atena-fulanodetal -p 4390` you will receive a url like this one `https://atena-fulanodetal.localtunnel.me`
- Copy forwarding address


### Create Slack app

-[Building Slack app](https://api.slack.com/slack-apps)
- Create a Slack app

  - App Name: `atena-sandbox-{yourname}`
  - Select Workspace: `Impulso - Sandbox`

- Setup:
  - Menu > Features > Event Subscriptions: activate
    - Request URL: Put ngrok address or localtunnel address
      - ngrok address - `http://{your-number}.ngrok.io/slack/events`
      - localtunnel address - `https://atena-{yourname}.localtunnel.me/slack/events`
    - Add Workspace Event:
      - `message.channels`, `reaction_added` and `reaction_removed`
    - Save Changes
  - Menu > Features > OAuth & Permissions
    - Scopes > Select Permission Scopes:
      - Add `users.profile:read` and `channels:read`
      - Save Changes
    - Install App to Workspace
    - Copy OAuth Access Token and add in SLACK_TOKEN on `.env`
  - Menu > Settings > Basic Information
    - Copy Signing Secret and add in SLACK_SIGNIN_EVENTS ON `.env`

### Google Analytcs account (optional)

- Create account
- Add Tracking code `UA-{number}` in GA on `.env`
