# ADR 02: Message broker

Problem: In a dynamically scaled environment we want to dispatch jobs to workers and then consume the result of their work in a scalable way. We don't want to make a custom implementation, though.

Available options: MongoDB-native queues, Redis queues, *MQs (RabbitMQ, NSQ etc.), Redis queues

Decision: Go with RabbitMQ

Reasoning: MongoDB would be utilized for persistence anyway, so there would be some cost efficiency in the long run. However, it would most likely require some custom logic being implemented in both Node.js and Python side, which is an upfront investment. For this project I decided to keep things as simple as possible - taking the extra RabbitMQ dependency (which is production-grade, battle tested) and the vast support that it already has.