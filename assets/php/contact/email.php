<?php

$emailcontent = '
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0;">
	<meta name="format-detection" content="telephone=no" />
    <meta name="author" content="Liam Siira @ Siira.us">

	<!-- Responsive Mobile-First Email Template by Konstantin Savchenko, 2015.
		https://github.com/konsav/email-templates/  -->

	<style>
		/* Reset styles */
		body {
			margin: 0;
			padding: 0;
			min-width: 100%;
			width: 100% !important;
			height: 100% !important;
		}

		body,
		table,
		td,
		div,
		p,
		a {
			-webkit-font-smoothing: antialiased;
			text-size-adjust: 100%;
			-ms-text-size-adjust: 100%;
			-webkit-text-size-adjust: 100%;
			line-height: 100%;
		}

		table,
		td {
			mso-table-lspace: 0pt;
			mso-table-rspace: 0pt;
			border-collapse: collapse !important;
			border-spacing: 0;
		}

		img {
			border: 0;
			line-height: 100%;
			outline: none;
			text-decoration: none;
			-ms-interpolation-mode: bicubic;
		}

		#outlook a {
			padding: 0;
		}

		.ReadMsgBody {
			width: 100%;
		}

		.ExternalClass {
			width: 100%;
		}

		.ExternalClass,
		.ExternalClass p,
		.ExternalClass span,
		.ExternalClass font,
		.ExternalClass td,
		.ExternalClass div {
			line-height: 100%;
		}

		/* Set color for auto links (addresses, dates, etc.) */
		a,
		a:hover {
			color: #FFFFFF;
		}

		.footer a,
		.footer a:hover {
			color: #828999;
		}
	</style>

	<!-- MESSAGE SUBJECT -->
	<title>Contact Form Submission</title>

</head>

<!-- BODY -->
<!-- Set message background color (twice) and text color (twice) -->

<body topmargin="0" rightmargin="0" bottommargin="0" leftmargin="0" marginwidth="0" marginheight="0" width="100%" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%; height: 100%; -webkit-font-smoothing: antialiased; text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; line-height: 100%;
	background-color: #111111;
	color: #FFFFFF;" bgcolor="#111111" text="#FFFFFF">

	<!-- SECTION / BACKGROUND -->
	<!-- Set message background color one again -->
	<table width="100%" align="center" border="0" cellpadding="0" cellspacing="0"
		style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; width: 100%;" class="background">
		<tr>
			<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;"
				bgcolor="#111111">

				<!-- WRAPPER -->
				<!-- Set wrapper width (twice) -->
				<table border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit;" class="wrapper">

					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
							padding-top: 20px;
							padding-bottom: 20px;">

							<!-- PREHEADER -->
							<!-- Set text color to background color -->
							<div style="display: none; visibility: hidden; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; height: 0; max-height: 0; max-width: 0;
								color: #2D3445;" class="preheader">
								Subject: None
							</div>
						</td>
					</tr>

					<!-- HERO IMAGE -->
					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;
							padding-top: 0px;" class="hero"><img border="0" vspace="0" hspace="0"
							src="' . $image . '"
							alt="Identicon" title="Identicon" width="200"
							style="
							color: #FFFFFF; font-size: 13px; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;" /></td>
					</tr>

					<!-- SUPHEADER -->
					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 14px; font-weight: 400; line-height: 150%; letter-spacing: 2px;
							padding-top: 27px;
							padding-bottom: 0;
							color: #FFFFFF;
							font-family: sans-serif;" class="supheader">
							Siira.us Contact Form
						</td>
					</tr>

					<!-- HEADER -->
					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0;  padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 24px; font-weight: bold; line-height: 130%;
							padding-top: 5px;
							color: #FFFFFF;
							font-family: sans-serif;" class="header">
							From: ' . $name . '
						</td>
					</tr>

					<!-- PARAGRAPH -->
					<tr>
						<td align="left" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 17px; font-weight: 400; line-height: 160%;
							padding-top: 15px;
							color: #FFFFFF;
							font-family: sans-serif;" class="paragraph">
							' . $message . '
						</td>
					</tr>

					<!-- BUTTON -->
					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
							padding-top: 25px;
							padding-bottom: 5px;" class="button">
							<!-- LOGO -->
							<img
							border="0" vspace="0" hspace="0"
							src="' . $logo . '"
							width="70"
							height="70" alt="Logo" title="Logo"
							style="
							color: #FFFFFF;
							font-size: 10px; margin: 0; padding: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: none; display: block;" />
						</td>
					</tr>

					<!-- LINE -->
					<!-- Set line color -->
					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%;
							padding-top: 30px;" class="line">
							<hr color="#AAAAAA" align="center" width="100%" size="1" noshade style="margin: 0; padding: 0;" />
						</td>
					</tr>

					<!-- FOOTER -->
					<!-- Set text color and font family ("sans-serif" or "Georgia, serif"). Duplicate all text styles in links, including line-height -->
					<tr>
						<td align="center" valign="top" style="border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: 13px; font-weight: 400; line-height: 150%;
							padding-top: 10px;
							padding-bottom: 20px;
							color: #AAAAAA;
							font-family: sans-serif;" class="footer">

							This email was sent via a PHP Script

						</td>
					</tr>

					<!-- End of WRAPPER -->
				</table>

				<!-- End of SECTION / BACKGROUND -->
			</td>
		</tr>
	</table>

</body>

</html>
';