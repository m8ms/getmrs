# getmrs
Lists all gitlab merge requests from your projects based on your user token.

### Usage
* casually
    ```shell script
    npx getmrs
    ```
* permanently:
    ```shell script
    npm install getmrs -g
    ```
    and then:
    ```shell script
    getmrs
    ```

### First run & setup

When you run the script for the first time,
it will ask you to provide these two essential pieces of information:
* your gitlab server address (ex. `gitlab.com`),
* personal access token, which can be found at: `<your_gitlab_server>/profile/personal_access_tokens`.

Then the script will lookup your projects and prompt you to select which of them
you would like to include in the CR list.

Project list can be overridden with `-p param`:
```shell script
getmrs -p your,project,names,or,ids,comma,sepparated
```

### Resetting config
The settings are written to: `<your_home_dir>/.getmrs_config`. 

You can update them by running: 
```shell script
getmrs -c
```
