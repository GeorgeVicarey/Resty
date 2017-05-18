FROM jboss/wildfly
ADD ./target/resty.war /opt/jboss/wildfly/standalone/deployments