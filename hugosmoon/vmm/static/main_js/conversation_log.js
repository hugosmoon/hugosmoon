console.log($.cookie('stunum'))
if(!$.cookie('conversation')){
    $.cookie('conversation',$.cookie('stunum')+'#'+Date.parse(new Date()),{ expires: 7, path: '/' }); 
}
let conversation=$.cookie('conversation')
let stunum=$.cookie('stunum')
let stuname=$.cookie('stuname')

setInterval(function(){create_conversation_log();},5000);


function create_conversation_log(){
   
    if(conversation){
        $.ajax({

            type: 'POST',
        
            url: "/vmm/create_conversation_log/" ,
        
            data: {
                'conversation':conversation,
                'stunum':stunum,
                'stuname':stuname
            } ,
        
        });
    }
}
