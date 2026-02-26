import qrcode

url = "https://flower-frontend.ashysand-5f2697d3.swedencentral.azurecontainerapps.io/"
qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save(r"c:\Secondary_Project\Womans_Week\flower_persona\qr-code.png")
print("QR code saved to qr-code.png")
qr.print_ascii(invert=True)
