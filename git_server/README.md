
### Git over HTTP

[Based on tutorial](http://blog.xuite.net/zack_pan/blog/65273998-GIT+over+HTTP+%28GIT+HTTP+Transparent%29)

add apache config file `/etc/httpd/conf.d/git.conf`

```
SetEnv GIT_PROJECT_ROOT /var/www/user_repos
SetEnv GIT_HTTP_EXPORT_ALL
ScriptAlias /repos/ /usr/libexec/git-core/git-http-backend/

<LocationMatch "^/repos/(?<user>[^/]+)">
     AuthType Basic
     AuthName "Git Access"
     AuthUserFile /var/www/passwd.git
     Require user "%{env:MATCH_USER}"
</LocationMatch>
```

Note: `chown -R apache:apache /var/www/user_repos/<repo_name>` is necessary.

### Send message for commits

1. git_server/templates/hooks/post-receive need to be executable
   ```
   chmod 777 post-receive
   ```
2. copy git_server folder to /var/www and change owner to apache:
   ```
   cp -r /home/admin/www/mo/git_server/ /var/www
   chown -R apache:apache /var/www/git_server/
   ```
3. `git push` need add `--option/-o` with project id to send message, e.g:
   ```
   git push -o 5b0d915e0c11f365133769da
   ```

### Environments

1. Git: 2.16.2

2. Httpd: Apache/2.4.33 (codeit)