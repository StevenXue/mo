
[ref tutorial](http://blog.xuite.net/zack_pan/blog/65273998-GIT+over+HTTP+%28GIT+HTTP+Transparent%29)

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
