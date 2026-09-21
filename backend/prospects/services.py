import re
import socket
import smtplib
import dns.resolver
from typing import Dict, Any

def verify_email_syntax(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(pattern, email) is not None

def verify_email_engine(email: str) -> Dict[str, Any]:
    """
    Verifies an email address using pure Python (Syntax -> DNS/MX -> SMTP Probe).
    Returns a dictionary of the verification results.
    """
    result = {
        'status': 'UNVERIFIED',
        'reason': '',
        'syntax_valid': False,
        'domain_valid': False,
        'mx_found': False,
        'smtp_checked': False,
        'smtp_valid': False,
        'is_disposable': False,  # Simplified for now
        'is_role_account': False,
        'is_catch_all': False,
    }

    # 1. Syntax Check
    if not verify_email_syntax(email):
        result['status'] = 'INVALID'
        result['reason'] = 'Invalid email syntax.'
        return result
    
    result['syntax_valid'] = True
    
    local_part, domain = email.split('@', 1)
    
    # Simple Role Check
    role_prefixes = ['info', 'admin', 'sales', 'support', 'contact', 'hello', 'billing', 'hr']
    if local_part.lower() in role_prefixes:
        result['is_role_account'] = True

    # 2. DNS & MX Lookup
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        # Sort by preference
        mx_records = sorted(mx_records, key=lambda record: record.preference)
        result['domain_valid'] = True
        result['mx_found'] = True
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, dns.exception.Timeout):
        result['status'] = 'INVALID'
        result['reason'] = f"Domain '{domain}' does not exist or has no valid MX records."
        return result
    except Exception as e:
        result['status'] = 'UNKNOWN'
        result['reason'] = f"DNS lookup failed: {str(e)}"
        return result

    # 3. SMTP Probing
    # We will try the first MX record
    mail_server = str(mx_records[0].exchange).rstrip('.')
    result['smtp_checked'] = True
    
    try:
        # SMTP probing can be slow or blocked by firewalls (port 25 is often blocked by ISPs/cloud providers)
        # We use a short timeout.
        server = smtplib.SMTP(mail_server, 25, timeout=10)
        server.ehlo_or_helo_if_needed()
        
        # Some servers require MAIL FROM to be a valid domain. We use a generic one.
        # Alternatively, we could use the domain itself or an empty sender.
        sender = 'verify@example.com' 
        code, resp = server.mail(sender)
        
        if code >= 400:
            server.quit()
            result['status'] = 'UNKNOWN'
            result['reason'] = f"SMTP server rejected sender. Code: {code}"
            return result

        # Check the actual recipient
        code, resp = server.rcpt(email)
        server.quit()

        if code == 250:
            result['status'] = 'VALID'
            result['smtp_valid'] = True
            result['reason'] = 'Mailbox accepted SMTP verification.'
        elif code >= 500:
            resp_text = resp.decode('utf-8', errors='ignore').lower()
            # If the 5xx error is due to IP blocking, policy, or spamhaus, it's our problem, not the email's problem.
            if any(keyword in resp_text for keyword in ['policy', 'spamhaus', 'dynamic ip', 'blocked', 'banned']):
                result['status'] = 'UNKNOWN'
                result['reason'] = f"SMTP verification blocked by recipient policy (IP/spam): {code} {resp_text}"
            else:
                # Permanent rejection (e.g. 550 User unknown)
                result['status'] = 'INVALID'
                result['reason'] = f"Mailbox rejected recipient. Permanent error: {code} {resp.decode('utf-8', errors='ignore')}"
        else:
            # Temporary error (e.g. 450, 451) or greylisting
            result['status'] = 'UNKNOWN'
            result['reason'] = f"SMTP server returned temporary/ambiguous response. Code: {code}"
            
    except (socket.timeout, ConnectionRefusedError, OSError) as e:
        # Port 25 might be blocked, or server is down/refusing connections to probing IPs
        result['status'] = 'UNKNOWN'
        result['reason'] = f"Mailbox existence could not be reliably determined (SMTP connection failed or blocked)."
    except Exception as e:
        result['status'] = 'UNKNOWN'
        result['reason'] = f"Unexpected error during SMTP probing: {str(e)}"

    return result
