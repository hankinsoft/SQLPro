//
//  SQLProKeywordsHelper.m
//  SQLProCore
//
//  Created by Kyle Hankinson on 2020-06-05.
//  Copyright © 2020 Hankinsoft Development, Inc. All rights reserved.
//

#import <SQLProResources/SQLProKeywordsHelper.h>

@implementation SQLProKeywordsHelper
{
    NSOrderedSet<NSString*>* keywords;
    NSOrderedSet<NSString*>* functions;
    NSOrderedSet<NSString*>* functionsAndKeywords;
}

+ (NSOrderedSet<NSString*>*) defaultKeywords
{
    static NSOrderedSet<NSString*>* defaultKeywords = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // https://github.com/fibo/SQL92-keywords/blob/master/index.json
        NSString * keywordsPath = [[NSBundle bundleForClass: SQLProKeywordsHelper.class] pathForResource: @"SQLProKeywords"
                                                                                                  ofType: @"json"];

        NSData * data = [NSData dataWithContentsOfFile: keywordsPath];
        NSError * error = nil;
        NSArray<NSString*>* keywords = [NSJSONSerialization JSONObjectWithData: data
                                                                       options: kNilOptions
                                                                         error: &error];

        
        defaultKeywords = [[NSOrderedSet alloc] initWithArray: [keywords sortedArrayUsingSelector: @selector(caseInsensitiveCompare:)]];
    });

    return defaultKeywords;
}

- (id) initWithKeywordsResourceName: (NSString*) keywordsResourceName
              functionsResourceName: (NSString*) functionsResourceName
{
    self = [self init];
    if(self)
    {
        // Setup our targetBundle
        NSBundle * targetBundle = [NSBundle bundleForClass: SQLProKeywordsHelper.class];

        // Setup our sqlKeywords
        NSMutableArray * sqlKeywords = nil;

        NSString * keywordsPath = [targetBundle pathForResource: keywordsResourceName
                                                         ofType: @"json"];

        NSData * data = [NSData dataWithContentsOfFile: keywordsPath];
        NSError * error = nil;
        NSArray<NSString*>* tempKeywords = [NSJSONSerialization JSONObjectWithData: data
                                                                           options: kNilOptions
                                                                             error: &error];

        if(tempKeywords.count)
        {
            sqlKeywords = [tempKeywords sortedArrayUsingSelector: @selector(caseInsensitiveCompare:)].mutableCopy;
        }
        else
        {
            sqlKeywords = @[].mutableCopy;
        }

        // Add the default keywords
        [sqlKeywords addObjectsFromArray: SQLProKeywordsHelper.defaultKeywords.array];
        [sqlKeywords sortUsingSelector: @selector(localizedCaseInsensitiveCompare:)];

        // Setup our sqlKeywords
        NSArray * sqlFunctions = nil;

        NSString * functionsPath = [targetBundle pathForResource: functionsResourceName
                                                         ofType: @"json"];

        data = [NSData dataWithContentsOfFile: functionsPath];
        NSDictionary<NSString*,NSDictionary*>* tempFunctions = [NSJSONSerialization JSONObjectWithData: data
                                                                                           options: kNilOptions
                                                                                             error: &error];

        if(tempFunctions.allKeys.count)
        {
            sqlFunctions = [tempFunctions.allKeys sortedArrayUsingSelector: @selector(caseInsensitiveCompare:)].mutableCopy;
        }
        else
        {
            sqlFunctions = @[];
        }

        keywords  = [NSOrderedSet orderedSetWithArray: sqlKeywords];
        functions = [NSOrderedSet orderedSetWithArray: sqlFunctions];

        NSMutableArray* found = @[].mutableCopy;
        for(NSString * keyword in keywords)
        {
            if(NSNotFound != [sqlFunctions indexOfObject: keyword.uppercaseString])
            {
                [found addObject: keyword];
            }
        }

        NSAssert(0 != sqlKeywords.count, @"Keywords cannot be empty.");
        NSAssert(0 != sqlFunctions.count, @"Functions cannot be empty.");

        NSMutableSet * allFunctionsAndKeywords = [NSMutableSet set];

        [allFunctionsAndKeywords addObjectsFromArray: sqlKeywords];
        [allFunctionsAndKeywords addObjectsFromArray: sqlFunctions];

        // Set our sorted set
        functionsAndKeywords = [NSOrderedSet orderedSetWithArray: [allFunctionsAndKeywords.allObjects sortedArrayUsingSelector: @selector(localizedCaseInsensitiveCompare:)]];
    }

    return self;
} // End of initWithBundle:resourceName:

- (NSOrderedSet<NSString*>*) keywords
{
    return keywords;
}

- (NSOrderedSet<NSString*>*) functions
{
    return functions;
}

- (NSOrderedSet<NSString*>*) functionsAndKeywords
{
    return functionsAndKeywords;
} // End of functionsAndKeywords

@end
