from flask import Flask
from auth.routes import auth_bp
from vendor.routes import vendor_bp



app = Flask(__name__)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(vendor_bp, url_prefix="/api/vendor")

@app.route("/")
def home():
    return {"status": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True)

@app.route("/api/ping", methods=["GET"])
def ping():
    return {"message": "Backend connected successfully"}
