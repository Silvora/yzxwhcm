const dataBase = {
    "global":{
        "logo_speed": 10000, // logo 旋转速度 数值越大越快

        "ring_gap": 20, // 环状图之间的间隔 数值越大越远
        "ring_circle": 60, // 环状图中心园的半径
        "ring_circle_color": "#f00", // 环状图中心园颜色
        "ring_active_color": "#f00", // 点击设置颜色
        "left_ring_speed": 0.0001, // 左环旋转速度

    },
    "data":[
        // 左边环状图
        {
            "company": "Company A",
            "description": "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions.",
            // 顺时针还是逆时针 false顺时针 true逆时针
            "clockwise": [true, false, true, false],
            "subsidiariesList":[
                [
                    {
                        "name": "Subsidiary Subsidiary Subsidiary A1",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#120"
                    },
                    {
                        "name": "A2",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#a20"
                    },
                    {
                        "name": "Subsidiary A1",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#120"
                    },
                    {
                        "name": "Subsidiary A2",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#a20"
                    }
                ],
                [
                    {
                        "name": "Subsidiary A3",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#aaa"
                    },
                    {
                        "name": "Subsidiary A4",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#345"
                    },
                    {
                        "name": "Subsidiary A3",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#aaa"
                    },
                    {
                        "name": "Subsidiary A4",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#345"
                    },
                    {
                        "name": "Subsidiary A3",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#aaa"
                    },
                    {
                        "name": "Subsidiary A4",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#345"
                    }
                ],
                [
                    {
                        "name": "Subsidiary A5",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#983"
                    },
                    {
                        "name": "Subsidiary A6",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#1456"
                    },
                    {
                        "name": "Subsidiary A5",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#983"
                    },
                ],
                [
                    {
                        "name": "Subsidiary A7",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#560"
                    },
                    {
                        "name": "Subsidiary A8",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#240"
                    },
                    {
                        "name": "Subsidiary A7",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#560"
                    },
                ]
            ]
        },
        // 右边环状图
        {
            "company": "Company B",
            "description": "Led a team of developers in creating a scalable e-commerce platform. Implemented RESTful APIs and integrated third-party services.",
            // 顺时针还是逆时针 false顺时针 true逆时针 右边设置没用
            "clockwise": [null],
            "subsidiariesList":[
                [
                    {
                        "name": "Subsidiary A1",
                        "description": "Worked on the front-end development of a mobile application using React Native.",
                        "color": "#690"
                    },
                    {
                        "name": "Subsidiary A2",
                        "description": "Contributed to the backend development of a microservices architecture using Node.js and Express.",
                        "color": "#140"
                    }
                ]
            ]
        }
      
    ]
}

export default dataBase;