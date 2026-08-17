$ORIGIN designlabnorth.com.
$TTL 60
@	IN	SOA	modyu.designlabnorth.com. admin.designlabnorth.com. (
			2026081501 ; serial
			300
			60
			604800
			60 )
	IN	NS	modyu.designlabnorth.com.
	IN	NS	swarmfund.designlabnorth.com.
	IN	NS	daa.designlabnorth.com.
	IN	A	82.165.5.84
www	IN	A	82.165.5.84
modyu	IN	A	82.165.5.84
swarmfund	IN	A	82.165.5.84
daa	IN	A	82.165.5.84
*	IN	A	82.165.5.84
