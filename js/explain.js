window.EXPLAIN = {
"shared-responsibility": [
 ["EC2 is infrastructure as a service: AWS secures the hardware and hypervisor, and you patch and harden the guest operating system and everything you install on it.", ["AWS stops at the hypervisor on EC2.", null, "Someone must patch it, and on EC2 that's you.", "ISPs have nothing to do with your instances."]],
 ["DynamoDB is fully managed: AWS patches and operates the servers. You still own IAM access, encryption choices, backups settings and your data.", ["You have no access to DynamoDB servers.", null, "Server patching is AWS's side; data and access are yours.", "Applications use the service; they don't patch it."]],
 ["Versioning keeps prior versions of objects, so accidental overwrites and deletes can be undone. That's integrity and recoverability.", ["Confidentiality comes from access control and encryption.", null, "Versioning doesn't speed anything up.", "Versioning actually increases storage cost."]],
 ["Defense in depth stacks independent controls (identity, network, encryption, detection, response) so one failure doesn't expose everything.", ["A single control is a single point of failure.", null, "Encryption is just one layer.", "MFA is just one layer."]]
],
"account-hygiene": [
 ["Root access keys can do anything and can't be restricted by IAM, so the best practice is to have none at all.", ["Rotation still leaves an all-powerful key that can leak.", null, "Sharing destroys accountability.", "Git history is public forever."]],
 ["ASIA-prefixed keys are temporary credentials from AWS STS (roles, Identity Center, federation). AKIA keys are long-lived user or root keys.", ["Long-lived keys start with AKIA.", null, "Root keys also start with AKIA.", "They're valid until they expire."]],
 ["The execution role gives Lambda temporary, automatically rotated credentials, with nothing stored in code or environment variables.", ["Keys in env vars are long-lived and visible to readers of the configuration.", null, "Root keys must never be used.", "Hard-coded keys end up in Git."]],
 ["The IAM credential report is a CSV listing every user's password status, MFA, access key age and last use, which is perfect for automated audits.", ["It's a CSV, not a PDF.", null, "CloudTrail logs API activity.", "Config rules evaluate configurations."]]
],
"cloudtrail": [
 ["Object-level S3 reads and writes are data events: high volume, off by default, and enabled per trail (often with selectors).", ["Management events cover bucket-level operations, not object reads.", null, "They're logged once you enable data events.", "Insights flags unusual API call rates."]],
 ["errorCode AccessDenied means someone attempted the call and IAM refused it; failed attempts are logged, and they're valuable for detection.", ["Successful calls have no errorCode.", null, "CloudTrail recorded it successfully.", "Deleted users can't make calls at all."]],
 ["Log file validation produces signed digest files; aws cloudtrail validate-logs proves whether any log file was changed or deleted.", ["Versioning keeps copies but doesn't prove integrity.", null, "Public buckets are a risk, not a protection.", "CloudWatch monitors; it doesn't verify integrity."]],
 ["Event history retains 90 days of management events at no cost. Create a trail (or CloudTrail Lake) for longer retention.", ["It's longer than 7 days.", null, "Only trails keep logs as long as you want.", "It's 90 days, not a year."]]
],
"threat-hunting": [
 ["An attempt to stop logging is a classic defense-evasion signal even when it fails; it means someone with credentials is trying to hide.", ["Ignoring attempts gives attackers more tries.", null, "It's not a bug; the event is real.", "Legitimate automation rarely tries to stop the org trail."]],
 ["Creating an access key for a different user is a persistence technique: the attacker keeps access even after the original key is revoked.", ["Rotation creates keys for yourself, not someone else.", null, "Recon reads information; this creates credentials.", "MFA setup doesn't create access keys."]],
 ["An SCP denying actions outside approved Regions stops crypto-miners from launching instances in Regions you never watch. Prevention beats detection.", ["Budgets alert after money is spent.", null, "More monitoring still lets the damage happen.", "Turning off CloudTrail removes your visibility."]],
 ["Root console logins should be rare and always use MFA; a successful root login without MFA is a high-severity event to investigate immediately.", ["Root without MFA is never fine.", null, "It's high, not low.", "It's possible whenever MFA isn't enforced."]]
],
"data-protection": [
 ["KMS generates a data key; the data is encrypted with the plaintext data key, and the data key is stored encrypted by the KMS key, which never leaves KMS.", ["KMS keys encrypt only small payloads (up to 4 KB) directly; big data uses data keys.", null, "Passwords aren't encryption keys.", "TLS protects data in transit, not at rest."]],
 ["Customer managed keys let you edit the key policy, enable rotation, add grants, disable or schedule deletion, and share across accounts.", ["AWS owned keys are invisible to you.", "AWS managed keys (aws/s3) have fixed policies.", null, "Customer managed keys allow it."]],
 ["Account-level S3 Block Public Access overrides any bucket policy or ACL that would make data public. Turn on all four settings.", ["Versioning protects against deletes, not exposure.", null, "Bucket Keys reduce KMS costs.", "Lifecycle rules move or expire objects."]],
 ["Amazon Macie uses machine learning and patterns to discover sensitive data such as PII and credentials in S3, and flags risky buckets.", ["GuardDuty detects threats from activity logs.", null, "Inspector finds software vulnerabilities.", "Shield protects against DDoS."]]
],
"secrets": [
 ["The secret is still in Git history, forks and caches, so assume it's compromised and rotate it immediately, then clean up.", ["Doing nothing leaves a working leaked credential.", null, "Renaming doesn't remove history.", "Private repos can still leak, and it may already have been copied."]],
 ["Secrets Manager has built-in rotation for RDS, Aurora, Redshift and DocumentDB, plus custom rotation with Lambda.", ["Parameter Store SecureString has no native rotation.", null, "KMS rotates encryption keys, not database passwords.", "S3 stores objects."]],
 ["Put only the secret's name or ARN in the environment variable; the code fetches the value from Secrets Manager at runtime.", ["Plain-text passwords in env vars are visible to anyone with read access to the function.", null, "KMS key material never leaves KMS.", "The code needs to know which secret to fetch."]],
 ["During rotation the new version is staged as AWSPENDING; finishSecret moves the AWSCURRENT label to it, and the old one becomes AWSPREVIOUS.", ["AWSCURRENT is the active version.", null, "AWSPREVIOUS is the version that was replaced.", "AWSNEW doesn't exist."]]
],
"network-security": [
 ["Port ranges include every port between FromPort and ToPort, so 0-65535 from anywhere exposes SSH, RDP, databases, everything.", ["22 falls inside the 0-65535 range.", null, "The rule is TCP, and SSH runs over TCP.", "This is an IPv4 rule (0.0.0.0/0)."]],
 ["Referencing the app tier's security group ID allows exactly those instances, even as they scale and change IPs.", ["0.0.0.0/0 exposes the database to the internet.", null, "Home IPs change and don't belong on servers.", "The whole VPC CIDR is broader than necessary."]],
 ["SSM Session Manager provides shell access through the agent's outbound HTTPS connection, so no inbound port, no SSH keys, and every session is logged.", ["Moving SSH to 2222 is obscurity; scanners find it.", null, "A NACL deny blocks access but doesn't give you a safe way in.", "Key size doesn't remove the exposed port."]],
 ["AWS WAF inspects HTTP requests (layer 7) and blocks SQL injection, XSS and bad bots with managed rule groups.", ["Security groups filter IPs and ports only.", null, "Shield Standard handles DDoS at layers 3 and 4.", "NACLs filter IPs and ports only."]]
],
"detection-services": [
 ["GuardDuty analyzes DNS logs, VPC Flow Logs and CloudTrail with threat intelligence, so queries to mining pools trigger CryptoCurrency findings.", ["Inspector scans for software vulnerabilities.", null, "Macie discovers sensitive data.", "Config checks configuration rules."]],
 ["Amazon Inspector continuously scans ECR images, EC2 instances and Lambda functions for known CVEs.", [null, "Macie looks at S3 data.", "Shield is DDoS protection.", "WAF filters web requests."]],
 ["Security Hub aggregates findings across services and accounts and runs standards like CIS and AWS Foundational Security Best Practices with a score.", ["Detective investigates findings.", null, "CloudTrail records API calls.", "Trusted Advisor gives best-practice checks but isn't a findings aggregator."]],
 ["GuardDuty severities: low is 1.0-3.9, medium is 4.0-6.9, and high is 7.0 and above.", ["Severity 1 is low.", "4 to 6.9 is medium.", null, "The scale doesn't reach 10."]]
],
"config-compliance": [
 ["AWS Config records configuration items over time, so you can see a security group's exact rules at any past point (and who changed it, via CloudTrail).", ["CloudTrail shows API calls, not the resulting configuration snapshot.", null, "GuardDuty detects threats.", "Macie finds sensitive data."]],
 ["Config rules evaluate resources as COMPLIANT, NON_COMPLIANT or NOT_APPLICABLE and report them with put_evaluations.", ["ALLOW and DENY are IAM effects.", null, "HIGH and LOW are severities.", "200 and 403 are HTTP status codes."]],
 ["Conformance packs bundle Config rules (and remediations) for frameworks like CIS or NIST and deploy them across an organization.", [null, "Stack policies protect CloudFormation resources.", "SCPs restrict permissions, not configuration evaluation.", "WAF filters web traffic."]],
 ["Config remediation actions run SSM Automation documents to fix non-compliant resources, manually or automatically.", [null, "Detective investigates.", "Artifact provides compliance reports.", "Shield protects against DDoS."]]
],
"incident-response": [
 ["Making the key Inactive and attaching a deny-all policy stops the attacker in seconds, is reversible, and preserves the evidence for investigation.", ["Deleting first destroys evidence and may break legitimate systems.", null, "Never contact the attacker.", "Waiting gives the attacker more time."]],
 ["Snapshot the EBS volumes and isolate the instance with a deny-all security group before changing anything else; this preserves forensic evidence.", ["Terminating destroys memory and disk evidence.", null, "Rebooting wipes memory evidence.", "A tag alone doesn't contain the threat."]],
 ["Attackers deliberately use Regions you don't monitor, so search CloudTrail and resources in every Region.", ["Your main Region is exactly where attackers avoid.", null, "Attackers touch many services beyond S3.", "Activity spans services beyond IAM."]],
 ["The root cause is a long-lived key. Replace it with an OIDC role that issues short-lived credentials, so there's nothing left to leak.", ["A longer key still leaks.", null, "Hiding isn't security.", "Yearly rotation leaves a long exposure window."]]
],
"auto-remediation": [
 ["CloudTrail management events are delivered to EventBridge as \"AWS API Call via CloudTrail\"; a rule matching the eventName invokes the Lambda.", ["CloudWatch alarms watch metrics, not specific API calls.", null, "S3 events are for object changes.", "SQS needs something to send messages to it."]],
 ["The CloudTrail record sits under event[\"detail\"]; the API's arguments are in requestParameters, including groupId and ipPermissions.", ["The top level of the event holds the envelope, not the parameters.", null, "The Lambda context has runtime info only.", "source is the service name (aws.ec2)."]],
 ["Security automation should follow least privilege too: only the exact fix actions (and notification), ideally scoped to the right resources.", ["ec2:* is far broader than needed.", null, "Admin access turns your security tool into a target.", "With no permissions it can't fix anything."]],
 ["Repeated remediations mean the cause is upstream: add a preventive control such as an SCP, an IaC scanner rule or a pipeline gate.", ["Ignoring hides a recurring risk.", null, "Disabling it leaves the problem unfixed.", "Memory isn't the problem."]]
],
"security-pillar": [
 ["A dedicated log-archive account keeps logs immutable and out of reach of workload admins, so attackers can't delete the evidence.", ["Workload admins could tamper with logs there.", null, "The management account should stay minimal.", "Public buckets expose logs."]],
 ["An SCP denying cloudtrail:StopLogging and DeleteTrail makes those actions impossible for everyone in member accounts, including admins.", ["GuardDuty detects; it doesn't prevent.", null, "Config rules detect and can remediate, but don't prevent.", "WAF filters web traffic."]],
 ["The AWS Certified Security - Specialty (SCS-C02) is the natural next step for cloud security after the Solutions Architect Associate.", [null, "CLF-C02 is the Cloud Practitioner, the starting point.", "DVA-C02 is the Developer Associate.", "MLS-C01 was the Machine Learning Specialty."]],
 ["The Security Pillar covers foundations, IAM, detection, infrastructure protection, data protection, incident response and application security. Cost optimization is a separate pillar.", ["Detection is a Security Pillar area.", "Data protection is a Security Pillar area.", null, "Incident response is a Security Pillar area."]]
]
};

/* merge into the lessons (loaded after lessons, before app.js) */
(function (E) { (window.LESSONS || []).forEach(l => { const x = E[l.id]; if (!x || !l.quiz) return; x.forEach((e, i) => { const q = l.quiz[i]; if (!q || !e) return; if (e[0]) q.why = e[0]; if (e[1]) q.w = e[1]; }); }); })(window.EXPLAIN || {});
