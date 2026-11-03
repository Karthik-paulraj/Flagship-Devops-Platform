FROM node

WORKDIR /home/app

COPY . .

RUN cd backend && npm install
RUN cd frontend && npm install


RUN chmod +x /home/app/executor.sh

EXPOSE 5000 5173

CMD ["/home/app/executor.sh"]	
