# open the folder using vs code
# naviage the api folder using vs code terminal

cd api
# create virtual environment using following command
python -m venv myenv

# activate  that
myenv/Scripts/activate

# install dependencies
pip install -r requirements.txt

# run the backend
flask run -h 192.168.8.196 -p 3000 --debug

# navigate to  client folder using terminal command
cd..
cd client

# install packages
npm install
# run the server
npx expo start

# download the expo go app in play store
# create account and log in
# scan the qr code in teminal



